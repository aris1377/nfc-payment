import { prisma } from '../config/prisma';
import { PaymentRepository } from '../repositories/payment.repository';
import { CardRepository } from '../repositories/card.repository';
import { SocketService } from './socket.service';
import { IpayService } from './ipay.service';
import { AppError } from '../utils/app-error';

export class PaymentService {
  static async getHistory(userId: number, query: any) {
    const page = parseInt(query.page as string, 10) || 1
    const limit = parseInt(query.limit as string, 10) || 20

    const { transactions, totalCount } = await PaymentRepository.findHistory(userId, page, limit)
    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: transactions,
      meta: {
        totalItems: totalCount,
        itemCount: transactions.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  static async initiateNfcPayment(userId: number, body: any) {
    const { cardId, socketId, merchantId, terminalId, amount, currency } = body;

    // 1. Bazadan kartani va faolligini tekshiramiz
    const card = await prisma.card.findFirst({
      where: { id: Number(cardId), userId, status: 'active' },
    });

    if (!card) {
      throw new AppError(404, 'E003', 'Karta topilmadi yoki faol emas'); 
    }

    // 2. Mobile ilovaga beriladigan zudlik bilan qaytariladigan chek/javob ma'lumoti
    const mockTransactionId = `TXN_${Date.now()}`;
    const mobileResponse = {
      status: 'success', 
      transactionId: mockTransactionId, 
      amount: amount,
      currency: currency, 
      maskedCard: card.cardNumberMasked, 
      timestamp: new Date().toISOString(),
    };

    // 3. ⚠️ ORQA FONDA (Background) ishlaydigan protsessni boshlaymiz (await'siz chaqiramiz)
    // Bu orqali mobile kutib o'tirmaydi, srazi HTTP response oladi.
    this.processBackgroundPayment(userId, card, body, mockTransactionId);

    // Mobilega darhol javob qaytariladi
    return mobileResponse;
  }

  // Orqa fonda 3-tomon bilan aloqa qiluvchi maxfiy metod
  private static async processBackgroundPayment(userId: number, card: any, body: any, transactionId: string) {
    const { socketId, terminalId, amount, currency } = body;

    try {
      console.log(`[Background] iPay ga so'rov yuborilyapti... Karta: ${card.id}`);

      // iPay so'mda ishlaydi, frontend tiyinda yuboradi → 100 ga bo'lamiz
      const amountInSom = Math.floor(amount / 100);

      // iPay dan pul yechish so'rovi
      const ipayRes = await IpayService.chargeCard(
        card.cardId!,
        card.cardToken!,
        amountInSom,
      );

      const is3rdPartySuccess = !ipayRes.error && ipayRes.result;

      if (is3rdPartySuccess) {
        // A. Bazaga muvaffaqiyatli tranzaksiyani yozamiz [cite: 146]
        await PaymentRepository.createTransaction({
          transactionId,
          userId,
          cardId: card.id,
          terminalId: parseInt(terminalId) || 1,
          amount,
          currency,
          status: 'approved', 
          socketId,
        });

        // B. iPay dan yangilangan balansni olib DB ga yozamiz
        const cardInfoRes = await IpayService.getCardsInfo([card.cardId!]);
        if (!cardInfoRes.error && cardInfoRes.result?.length > 0) {
          const updatedBalance = cardInfoRes.result[0].balance?.toString();
          if (updatedBalance) {
            await CardRepository.updateBalance(card.id, updatedBalance);
          }
        }

        // C. Terminalga soket orqali APPROVED xabarini otamiz
        SocketService.emitToRoom(socketId, 'payment_result', {
          status: 'approved',
          transactionId: transactionId,
          amount: amount,
          maskedCard: card.cardNumberMasked?.slice(-4) ?? null,
        });

        console.log(`[Background] To'lov muvaffaqiyatli yakunlandi va terminalga soket yuborildi.`);
      } else {
        // Agar 3-tomon rad etsa (masalan balans yetmasa)
        await PaymentRepository.createTransaction({
          transactionId,
          userId,
          cardId: card.id,
          terminalId: parseInt(terminalId) || 1,
          amount,
          currency,
          status: 'declined', 
          socketId,
          reason: 'insufficient_funds' 
        });

        SocketService.emitToRoom(socketId, 'payment_result', {
          status: 'declined',
          reason: ipayRes.error?.message || 'insufficient_funds',
          errorCode: 'E001',
        });
      }

    } catch (error: any) {
      console.error("[Background Error] To'lovda xatolik:", error.message);
      
      // Tizimda kutilmagan xato bo'lsa ham terminal osilib qolmasligi uchun xabar yuboramiz
      SocketService.emitToRoom(socketId, 'payment_result', {
        status: 'declined', 
        reason: 'system_error',
        errorCode: 'E010' 
      });
    }
  }
}
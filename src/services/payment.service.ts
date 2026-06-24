import { prisma } from '../config/prisma'
import { PaymentRepository } from '../repositories/payment.repository'
import { CardRepository } from '../repositories/card.repository'
import { IpayService } from './ipay.service'
import { AppError } from '../utils/app-error'
import redisClient from '../config/redis'
import { SocketService } from './socket.service'

export class PaymentService {
	static async initiateNfcPayment(userId: number, body: any) {
		const { cardId, amount, currency, merchantUuid } = body

		const card = await prisma.card.findFirst({
			where: { id: Number(cardId), userId, status: 'active' },
		})

		if (!card) {
			throw new AppError(404, 'E003', 'Karta topilmadi yoki faol emas')
		}

		const merchant = await prisma.merchant.findUnique({
			where: { uuid: merchantUuid },
			select: { id: true },
		})

		if (!merchant) {
			throw new AppError(404, 'E003', 'Merchant topilmadi')
		}

		const transactionId = `TXN_${Date.now()}`
		const amountInSom = Math.floor(amount / 100)

		let ipayRes: any
		try {
			ipayRes = await IpayService.chargeCard(
				card.cardId!,
				card.cardToken!,
				amountInSom,
			)
		} catch (err: any) {
			if (err.code === 'ECONNABORTED') {
				throw new AppError(
					504,
					'E011',
					"To'lov tizimi javob bermadi, qayta urinib ko'ring",
				)
			}
			throw new AppError(502, 'E010', "To'lov tizimiga ulanishda xatolik")
		}

		const isSuccess = !ipayRes.error && ipayRes.result
		const ipayTransactionId =
			parseInt(ipayRes.result?.details?.transaction_id) || undefined

		if (isSuccess) {
			await PaymentRepository.createTransaction({
				transactionId,
				userId,
				cardId: card.id,
				merchantId: merchant.id,
				amount,
				currency,
				status: 'approved',
				ipayTransactionId,
			})

			const cardInfoRes = await IpayService.getCardsInfo([card.cardId!])
			if (!cardInfoRes.error && cardInfoRes.result?.length > 0) {
				const updatedBalance = cardInfoRes.result[0].balance?.toString()
				if (updatedBalance) {
					await CardRepository.updateBalance(card.id, updatedBalance)
					await redisClient.del(`card:${card.id}:user:${userId}`)
				}
			}
			SocketService.emitToRoom(`merchant:${merchantUuid}`, 'payment:received', {
				amount,
				currency,
				maskedCard: card.cardNumberMasked,
				timestamp: new Date().toISOString(),
				transactionId,
			})
			SocketService.emitToRoom(`user:${userId}`, 'payment:sent', {
				amount,
				currency,
				maskedCard: card.cardNumberMasked,
				timestamp: new Date().toISOString(),
				transactionId,
			})
			return {
				status: 'success',
				ipayTransactionId,
				amount,
				currency,
				maskedCard: card.cardNumberMasked,
				timestamp: new Date().toISOString(),
			}
		} else {
			await PaymentRepository.createTransaction({
				transactionId,
				userId,
				cardId: card.id,
				merchantId: merchant.id,
				amount,
				currency,
				status: 'declined',
				reason: 'insufficient_funds',
			})

			throw new AppError(
				400,
				'E001',
				ipayRes.error?.message || 'Balans yetarli emas',
			)
		}
	}

	static async getHistory(userId: number, query: any) {
		const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20

		const { transactions, totalCount } = await PaymentRepository.findHistory(
			userId,
			page,
			limit,
		)
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

	static async getChequeDetails(ipayTransactionId: number) {
		const ipayRes = await IpayService.getChequeDetails(ipayTransactionId)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(
				404,
				'E003',
				ipayRes.error?.message || "Chek ma'lumotlari topilmadi",
			)
		}

		return {
			success: true,
			data: ipayRes.result,
		}
	}

	static async getCheque(ipayTransactionId: number) {
		const ipayRes = await IpayService.getCheque(ipayTransactionId)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(
				404,
				'E003',
				ipayRes.error?.message || 'Chek topilmadi',
			)
		}

		return {
			success: true,
			data: ipayRes.result,
		}
	}
}

import { log } from 'console'
import { CardRepository } from '../repositories/card.repository'
import { AppError } from '../utils/app-error'
import { IpayService } from './ipay.service'
import { AuthRepository } from '../repositories/auth.repository'

export class CardService {
	// 1. Karta qo'shishni boshlash (Prepare)
	static async prepareRegistration(userId: number, body: any) {
		const userExists = await AuthRepository.findUserById(userId)
		if (!userExists || userExists.status !== 'active') {
			throw new AppError(
				404,
				'E005',
				"Foydalanuvchi tizimda mavjud emas yoki faol emas. Karta qo'shib bo'lmaydi.",
			)
		}
		const { phoneNumber, cardNumber, cardExpire } = body

		// Bankka (iPay) ro'yxatdan o'tkazish so'rovini yuboramiz
		const ipayRes = await IpayService.registerCard(
			phoneNumber,
			cardNumber,
			cardExpire,
		)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(400, 'E010', ipayRes.error?.message || 'Bank xatoligi')
		}

		const { id, masked_phone_number } = ipayRes.result

		// 860014XXXXXX1501 → 860014******1501
		const cardNumberMasked = `${cardNumber.substring(0, 6)}******${cardNumber.substring(12)}`

		// DB da bu karta avval qo'shilganmi tekshiramiz
		const existing = await CardRepository.findExisting(userId, id)

		if (existing) {
			if (existing.status === 'active') {
				throw new AppError(400, 'E010', "Bu karta allaqachon qo'shilgan")
			}
			if (existing.status === 'deleted') {
				await CardRepository.restoreCard(existing.id)
				return {
					cardIdFromBank: existing.cardId,
					maskedPhoneNumber: existing.maskedPhoneNumber,
					message: 'Tasdiqlash kodi yuborildi',
				}
			}
		}

		// O'zimizning bazaga pending holatda saqlab qo'yamiz
		await CardRepository.createPending(userId, id, masked_phone_number, cardNumberMasked)

		return {
			cardIdFromBank: id,
			maskedPhoneNumber: masked_phone_number,
			message: 'Tasdiqlash kodi yuborildi',
		}
	}

	// 2. OTP kodni tasdiqlash va faollashtirish (Confirm)
	static async confirmRegistration(userId: number, body: any) {
		const { cardId, confirmCode } = body

		// Avval bazamizda shunday pending karta borligini tekshiramiz
		const existingCard = await CardRepository.findByCardId(cardId, userId)
		if (!existingCard) {
			throw new AppError(404, 'E003', 'Karta topilmadi yoki allaqachon tasdiqlangan')
		}

		// iPay bank protsessingiga tasdiqlash kodini yuboramiz
		const ipayRes = await IpayService.confirmCard(cardId, confirmCode)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(
				400,
				'E010',
				ipayRes.error?.message || "Tasdiqlash kodi noto'g'ri",
			)
		}


		const { card_token, card_data } = ipayRes.result

		// iPay muvaffaqiyatli token bergach, o'zimizning bazada kartani active holatga o'tkazamiz
		// existingCard.id → DB primary key (to'g'ri kartani topish uchun)
		const updatedCard = await CardRepository.activateCard(
			existingCard.id,
			card_token,
			card_data.expiry,
			card_data.balance.toString(),
		)

		return {
			status: 'success',
			cardId: updatedCard.cardId,
			cardNumberMasked: updatedCard.cardNumberMasked,
			balance: updatedCard.balance,
		}
	}

	// 3. Kartalar ro'yxatini olish (CRUD - Read)
	static async getUserCards(userId: number, query: any) {
		const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20

		const { cards, totalCount } = await CardRepository.findAllByUserId(
			userId,
			page,
			limit,
		)
		const totalPages = Math.ceil(totalCount / limit)
		return {
			data: cards,
			meta: {
				totalItems: totalCount,
				itemCount: cards.length,
				itemsPerPage: limit,
				totalPages: totalPages,
				currentPage: page,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	}

	// 4. Bitta kartani olish (Read)
	static async getCard(userId: number, cardId: number) {
		const card = await CardRepository.findById(cardId)
		if (!card || card.userId !== userId) {
			throw new AppError(404, 'E003', 'Karta topilmadi')
		}
		const { userId: _, ...cardWithoutUserId } = card
		return cardWithoutUserId
	}

	// 4. Kartani o'chirish (CRUD - Delete)
	static async removeCard(userId: number, cardId: number) {
		// iPay tizimidan o'chirish/bloklash kerak bo'lsa ipayService chaqiriladi, keyin DBdan o'chiriladi
		const result = await CardRepository.deleteCard(cardId, userId)
		if (result.count === 0) {
			throw new AppError(404, 'E003', "O'chiriladigan karta topilmadi")
		}
		return { success: true, message: "Karta muvaffaqiyatli o'chirildi" }
	}
}

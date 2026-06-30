import { CardRepository } from '../repositories/card.repository'
import { AppError } from '../utils/app-error'
import { IpayService } from './ipay.service'
import { AuthRepository } from '../repositories/auth.repository'
import redisClient from '../config/redis'

export class CardService {
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

		const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`
		if (normalizedPhone !== userExists.phone) {
			throw new AppError(400, 'E001', 'Telefon raqam hisobingizdagi raqam bilan mos emas')
		}

		const ipayRes = await IpayService.registerCard(phoneNumber, cardNumber, cardExpire)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(400, 'E010', ipayRes.error?.message || 'Bank xatoligi')
		}

		const { id, masked_phone_number } = ipayRes.result
		const cardNumberMasked = `${cardNumber.substring(0, 6)}******${cardNumber.substring(12)}`
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

		await CardRepository.createPending(userId, id, masked_phone_number, cardNumberMasked)

		return {
			cardIdFromBank: id,
			maskedPhoneNumber: masked_phone_number,
			message: 'Tasdiqlash kodi yuborildi',
		}
	}

	static async confirmRegistration(userId: number, body: any) {
		const { cardId, confirmCode } = body

		const existingCard = await CardRepository.findByCardId(cardId, userId)
		if (!existingCard) {
			throw new AppError(404, 'E003', 'Karta topilmadi yoki allaqachon tasdiqlangan')
		}

		const ipayRes = await IpayService.confirmCard(cardId, confirmCode)

		if (ipayRes.error || !ipayRes.result) {
			throw new AppError(400, 'E010', ipayRes.error?.message || "Tasdiqlash kodi noto'g'ri")
		}

		const { card_token, card_data } = ipayRes.result

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

	static async getUserCards(userId: number, query: any) {
		const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20

		const { cards, totalCount } = await CardRepository.findAllByUserId(userId, page, limit)
		const totalPages = Math.ceil(totalCount / limit)

		return {
			data: cards,
			meta: {
				totalItems: totalCount,
				itemCount: cards.length,
				itemsPerPage: limit,
				totalPages,
				currentPage: page,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	}

	static async getCard(userId: number, cardId: number) {
		const cacheKey = `card:${cardId}:user:${userId}`
		const cachedCard = await redisClient.get(cacheKey)
		if (cachedCard) return JSON.parse(cachedCard)

		const card = await CardRepository.findById(cardId)
		if (!card || card.userId !== userId) {
			throw new AppError(404, 'E003', 'Karta topilmadi')
		}
		const { userId: _, ...cardWithoutUserId } = card

		await redisClient.set(cacheKey, JSON.stringify(cardWithoutUserId), { EX: 300 })
		return cardWithoutUserId
	}

	static async removeCard(userId: number, cardId: number) {
		const result = await CardRepository.deleteCard(cardId, userId)
		if (result.count === 0) {
			throw new AppError(404, 'E003', "O'chiriladigan karta topilmadi")
		}
		await redisClient.del(`card:${cardId}:user:${userId}`)
		return { success: true, message: "Karta muvaffaqiyatli o'chirildi" }
	}
}

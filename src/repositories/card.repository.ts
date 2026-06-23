import { prisma } from '../config/prisma'

export class CardRepository {
	// 1. Yangi kartani pending holatda yaratish
	static async createPending(
		userId: number,
		cardId: string,
		maskedPhoneNumber: string,
		cardNumberMasked: string,
	) {
		return prisma.card.create({
			data: {
				userId,
				cardId,
				maskedPhoneNumber,
				cardNumberMasked,
				status: 'pending',
			},
		})
	}

	// 2. Bank ID bo'yicha kartani topish (tasdiqlash uchun)
	static async findByCardId(cardId: string, userId: number) {
		return prisma.card.findFirst({
			where: { cardId, userId, status: 'pending' },
			orderBy: { createdAt: 'desc' },
		})
	}

	// 3. Kartani faollashtirish va tokenini saqlash (Confirm bosqichida)
	static async activateCard(
		id: number,
		cardToken: string,
		expiry: string,
		balance: string,
	) {
		return prisma.card.update({
			where: { id },
			data: {
				cardToken,
				expiry,
				balance,
				status: 'active',
			},
		})
	}

	// 4. Foydalanuvchining barcha faol kartalarini olish (Read)
	static async findAllByUserId(userId: number, page: number, limit: number) {
		const skip = (page - 1) * limit

		const [cards, totalCount] = await prisma.$transaction([
			prisma.card.findMany({
				where: { userId, status: 'active' },
				select: {
					id: true,
					cardId: true,
					cardNumberMasked: true,
					maskedPhoneNumber: true,
					expiry: true,
					bankName: true,
					bankLogo: true,
					cardLogo: true,
					status: true,
					balance: true,
					createdAt: true,
				},
				skip: skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.card.count({
				where: { userId, status: 'active' },
			}),
		])
		return { cards, totalCount }
	}

	// 4. Bitta kartani topish (Read)
	static async findById(id: number) {
		return prisma.card.findUnique({
			where: { id },
			select: {
				id: true,
				userId: true,
				cardId: true,
				cardNumberMasked: true,
				maskedPhoneNumber: true,
				expiry: true,
				bankName: true,
				bankLogo: true,
				cardLogo: true,
				status: true,
				balance: true,
				createdAt: true,
			},
		})
	}

	// 5. Kartani o'chirish (status: deleted)
	static async deleteCard(id: number, userId: number) {
		return prisma.card.updateMany({
			where: { id, userId },
			data: { status: 'deleted' },
		})
	}

	// 6. Mavjud kartani topish (cardId va userId bo'yicha)
	static async findExisting(userId: number, cardId: string) {
		return prisma.card.findFirst({
			where: { userId, cardId },
		})
	}

	// 7. O'chirilgan kartani pending ga qaytarish
	static async restoreCard(id: number) {
		return prisma.card.update({
			where: { id },
			data: { status: 'pending' },
		})
	}

	// 8. Kartaning balansini yangilash
	static async updateBalance(id: number, balance: string) {
		return prisma.card.update({
			where: { id },
			data: { balance },
		})
	}
}

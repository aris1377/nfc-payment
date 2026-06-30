import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { MerchantRepository } from '../repositories/merchant.repository'
import { AppError } from '../utils/app-error'
import redisClient from '../config/redis'

export class MerchantService {
	static async createMerchant(body: {
		name: string
		login: string
		password: string
		vendorId?: number
		commission?: number
	}) {
		const { name, login, password, vendorId, commission = 0 } = body

		if (!name) {
			throw new AppError(400, 'E001', 'Merchant nomi kiritilishi shart')
		}

		if (!login) {
			throw new AppError(400, 'E001', 'Login kiritilishi shart')
		}

		if (!password || password.length < 6) {
			throw new AppError(
				400,
				'E001',
				"Parol kamida 6 ta belgidan iborat bo'lishi kerak",
			)
		}

		if (commission < 0 || commission > 100) {
			throw new AppError(
				400,
				'E001',
				"Komissiya 0 dan 100 gacha bo'lishi kerak",
			)
		}

		const apiKey = crypto.randomBytes(32).toString('hex')
		const hashedPassword = await bcrypt.hash(password, 10)

		const merchant = await MerchantRepository.create({
			name,
			login,
			password: hashedPassword,
			vendorId,
			commission,
			apiKey,
		})

		return { ...merchant, apiKey }
	}

	static async getMerchants(query: any) {
		const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20
		const { merchants, totalCount } = await MerchantRepository.findAll(
			page,
			limit,
		)
		const totalPages = Math.ceil(totalCount / limit)

		return {
			data: merchants,
			meta: {
				totalItems: totalCount,
				itemCount: merchants.length,
				itemsPerPage: limit,
				totalPages,
				currentPage: page,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	}

	static async getMerchant(uuid: string) {
		const merchant = await MerchantRepository.findByUuid(uuid)
		if (!merchant) {
			throw new AppError(404, 'E003', 'Merchant topilmadi')
		}
		return merchant
	}

	static async getRevByUuid(uuid: string) {
		const cacheKey = `merchant:revenue:daily:${uuid}`
		const cached = await redisClient.get(cacheKey)
		if (cached) return JSON.parse(cached)

		const merchant = await MerchantRepository.findRevByUuid(uuid)
		if (!merchant) {
			throw new AppError(404, 'E003', 'Merchant topilmadi')
		}

		await redisClient.set(cacheKey, JSON.stringify(merchant), { EX: 86400 })
		return merchant
	}

	static async updateMerchant(
		uuid: string,
		body: {
			name?: string
			vendorId?: number
			commission?: number
			status?: string
		},
	) {
		const merchant = await MerchantRepository.findByUuid(uuid)
		if (!merchant) {
			throw new AppError(404, 'E003', 'Merchant topilmadi')
		}

		if (
			body.commission !== undefined &&
			(body.commission < 0 || body.commission > 100)
		) {
			throw new AppError(
				400,
				'E001',
				"Komissiya 0 dan 100 gacha bo'lishi kerak",
			)
		}

		const updated = await MerchantRepository.update(uuid, body)
		await redisClient.del(`merchant:profile:${uuid}`)
		return updated
	}

	static async getDailyRevenue(query: any) {
		const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20
		const { dailyRevenue, totalCount } =
			await MerchantRepository.getDailyRevenue(page, limit)

		const totalPages = Math.ceil(totalCount / limit)

		return {
			data: dailyRevenue,
			meta: {
				totalItems: totalCount,
				itemCount: dailyRevenue.length,
				itemsPerPage: limit,
				totalPages,
				currentPage: page,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		}
	}

	static async createTerminal(uuid: string, body: { serialNumber: string }) {
		const merchant = await MerchantRepository.findByUuid(uuid)
		if (!merchant) {
			throw new AppError(404, 'E003', 'Merchant topilmadi')
		}

		if (!body.serialNumber) {
			throw new AppError(400, 'E001', 'Serial raqam kiritilishi shart')
		}

		return MerchantRepository.createTerminal({
			merchantId: merchant.id,
			serialNumber: body.serialNumber,
		})
	}
}

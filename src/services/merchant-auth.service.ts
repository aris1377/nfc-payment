import bcrypt from 'bcryptjs'
import { MerchantRepository } from '../repositories/merchant.repository'
import { PaymentRepository } from '../repositories/payment.repository'
import { AppError } from '../utils/app-error'
import { generateAccessToken } from '../utils/jwt.helper'
import redisClient from '../config/redis'

export class MerchantAuthService {
  static async login(login: string, password: string) {
    if (!login || !password) {
      throw new AppError(400, 'E001', 'Login va parol kiritilishi shart')
    }

    const merchant = await MerchantRepository.findByLogin(login)
    if (!merchant) {
      throw new AppError(401, 'E002', 'Login yoki parol noto\'g\'ri')
    }

    if (merchant.status !== 'active') {
      throw new AppError(403, 'E003', 'Merchant faol emas')
    }

    const isValid = await bcrypt.compare(password, merchant.password)
    if (!isValid) {
      throw new AppError(401, 'E002', 'Login yoki parol noto\'g\'ri')
    }

    const token = generateAccessToken({ merchantUuid: merchant.uuid, role: 'merchant' }, '7d')
    return {
      token,
      merchant: { uuid: merchant.uuid, name: merchant.name, login: merchant.login },
    }
  }

  static async getTransactions(uuid: string, query: any) {
    const merchant = await MerchantRepository.findByUuid(uuid)
    if (!merchant) {
      throw new AppError(404, 'E003', 'Merchant topilmadi')
    }

    const page = parseInt(query.page as string, 10) || 1
    const limit = parseInt(query.limit as string, 10) || 20

    const { transactions, totalCount } = await PaymentRepository.findByMerchantId(merchant.id, page, limit)
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

  static async getMe(uuid: string) {
    const cacheKey = `merchant:profile:${uuid}`
    const cached = await redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const merchant = await MerchantRepository.findByUuid(uuid)
    if (!merchant) {
      throw new AppError(404, 'E003', 'Merchant topilmadi')
    }

    await redisClient.set(cacheKey, JSON.stringify(merchant), { EX: 1800 })
    return merchant
  }
}

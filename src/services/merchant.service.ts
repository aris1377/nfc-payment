import crypto from 'crypto'
import { MerchantRepository } from '../repositories/merchant.repository'
import { AppError } from '../utils/app-error'

export class MerchantService {
  static async createMerchant(body: {
    name: string
    vendorId?: number
    commission?: number
  }) {
    const { name, vendorId, commission = 0 } = body

    if (!name) {
      throw new AppError(400, 'E001', 'Merchant nomi kiritilishi shart')
    }

    if (commission < 0 || commission > 100) {
      throw new AppError(400, 'E001', 'Komissiya 0 dan 100 gacha bo\'lishi kerak')
    }

    // Noyob API key generatsiya
    const apiKey = crypto.randomBytes(32).toString('hex')

    const merchant = await MerchantRepository.create({
      name,
      vendorId,
      commission,
      apiKey,
    })

    return { ...merchant, apiKey }
  }

  static async getMerchants(query: any) {
    const page = parseInt(query.page as string, 10) || 1
		const limit = parseInt(query.limit as string, 10) || 20
    const {merchants, totalCount} = await MerchantRepository.findAll(page, limit,)
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

  static async updateMerchant(uuid: string, body: {
    name?: string
    vendorId?: number
    commission?: number
    status?: string
  }) {
    const merchant = await MerchantRepository.findByUuid(uuid)
    if (!merchant) {
      throw new AppError(404, 'E003', 'Merchant topilmadi')
    }

    if (body.commission !== undefined && (body.commission < 0 || body.commission > 100)) {
      throw new AppError(400, 'E001', 'Komissiya 0 dan 100 gacha bo\'lishi kerak')
    }

    return MerchantRepository.update(uuid, body)
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

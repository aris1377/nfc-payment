import { Response, NextFunction } from 'express'
import { MerchantAuthService } from '../services/merchant-auth.service'
import { MerchantRequest } from '../middlewares/merchant-auth.middleware'

export class MerchantAuthController {
  static async login(req: MerchantRequest, res: Response, next: NextFunction) {
    try {
      const result = await MerchantAuthService.login(req.body.login, req.body.password)
      return res.status(200).json({ status: 'success', ...result })
    } catch (error) {
      next(error)
    }
  }

  static async transactions(req: MerchantRequest, res: Response, next: NextFunction) {
    try {
      const result = await MerchantAuthService.getTransactions(req.merchantUuid!, req.query)
      return res.status(200).json({ status: 'success', ...result })
    } catch (error) {
      next(error)
    }
  }

  static async me(req: MerchantRequest, res: Response, next: NextFunction) {
    try {
      const result = await MerchantAuthService.getMe(req.merchantUuid!)
      return res.status(200).json({ status: 'success', data: result })
    } catch (error) {
      next(error)
    }
  }
}

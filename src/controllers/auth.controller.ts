import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'

export class AuthController {
  // POST /api/auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body
      const result = await AuthService.login(phone)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/auth/confirm
  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, otp } = req.body
      const result = await AuthService.confirmOtp(Number(userId), otp)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/auth/refresh
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      const result = await AuthService.refreshToken(refreshToken)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
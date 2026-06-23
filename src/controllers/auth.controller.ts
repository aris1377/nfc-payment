import { Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'

export class AuthController {
  // POST /api/auth/login
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body
      const result = await AuthService.login(phone)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/auth/confirm
  static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, otp } = req.body
      const result = await AuthService.confirmOtp(Number(userId), otp)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/auth/refresh
  static async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      const result = await AuthService.refreshToken(refreshToken)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/auth/me
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const result = await AuthService.getMe(userId)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // PATCH /api/auth/me
  static async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const result = await AuthService.updateMe(userId, req.body)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
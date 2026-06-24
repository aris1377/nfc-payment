import { AuthRepository } from '../repositories/auth.repository'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.helper'
import { AppError } from '../utils/app-error'
import { JwtPayload } from 'jsonwebtoken'
import redisClient from '../config/redis'

export class AuthService {
  static async login(phone: string) {
    if (!phone) {
      throw new AppError(400, 'E001', 'Telefon raqami kiritilishi shart')
    }

    const user = await AuthRepository.findOrCreateUser(phone)

    return {
      success: true,
      userId: user.id,
      mockOtp: '123456',
      message: 'OTP kod yuborildi',
    }
  }

  static async confirmOtp(userId: number, otp: string) {
    if (!userId || !otp) {
      throw new AppError(400, 'E002', 'Foydalanuvchi ID yoki OTP kodi yetarli emas')
    }

    if (otp !== '123456') {
      throw new AppError(400, 'E003', "Tasdiqlash kodi noto'g'ri")
    }

    const user = await AuthRepository.findUserById(userId)
    if (!user || user.status !== 'active') {
      throw new AppError(404, 'E004', 'Foydalanuvchi topilmadi yoki faol emas')
    }

    const payload = { userId: user.id }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    return {
      success: true,
      message: 'Muvaffaqiyatli tizimga kirildi',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      accessToken,
      refreshToken,
    }
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError(400, 'E002', 'Refresh token kiritilishi shart')
    }

    let decoded: JwtPayload
    try {
      decoded = verifyToken(refreshToken) as JwtPayload
    } catch {
      throw new AppError(401, 'E004', 'Refresh token yaroqsiz yoki muddati tugagan')
    }

    const user = await AuthRepository.findUserById(decoded.userId)
    if (!user || user.status !== 'active') {
      throw new AppError(401, 'E004', 'Foydalanuvchi topilmadi yoki faol emas')
    }

    const payload = { userId: user.id }
    const accessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    }
  }

  static async getMe(userId: number) {
    const cacheKey = `user:profile:${userId}`

    const cached = await redisClient.get(cacheKey)
    if (cached) return { success: true, user: JSON.parse(cached) }

    const user = await AuthRepository.findUserById(userId)
    if (!user || user.status !== 'active') {
      throw new AppError(404, 'E004', 'Foydalanuvchi topilmadi')
    }

    const profile = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt,
    }

    await redisClient.set(cacheKey, JSON.stringify(profile), { EX: 600 })

    return { success: true, user: profile }
  }

  static async updateMe(userId: number, body: { name?: string }) {
    const { name } = body

    if (!name || name.trim().length === 0) {
      throw new AppError(400, 'E001', 'Ism kiritilishi shart')
    }

    if (name.trim().length > 100) {
      throw new AppError(400, 'E001', "Ism 100 ta belgidan oshmasligi kerak")
    }

    const user = await AuthRepository.findUserById(userId)
    if (!user || user.status !== 'active') {
      throw new AppError(404, 'E004', 'Foydalanuvchi topilmadi')
    }

    const updated = await AuthRepository.updateUser(userId, { name: name.trim() })

    await redisClient.del(`user:profile:${userId}`)

    return {
      success: true,
      user: updated,
    }
  }
}

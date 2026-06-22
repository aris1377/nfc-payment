import { AuthRepository } from '../repositories/auth.repository'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.helper'
import { AppError } from '../utils/app-error'
import { JwtPayload } from 'jsonwebtoken'

export class AuthService {
  // 1-bosqich: Login boshlash
  static async login(phone: string) {
    if (!phone) {
      throw new AppError(400, 'E001', 'Telefon raqami kiritilishi shart')
    }

    // Foydalanuvchini tekshiramiz yoki yaratamiz
    const user = await AuthRepository.findOrCreateUser(phone)

    // SMS provayder yo'qligi uchun mock OTP qaytaramiz
    return {
      success: true,
      userId: user.id,
      mockOtp: '123456', // Sinov uchun
      message: 'OTP kod yuborildi',
    }
  }

  // 3-bosqich: Refresh token orqali yangi access token olish
  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError(400, 'E002', 'Refresh token kiritilishi shart')
    }

    // Tokenni tekshiramiz
    let decoded: JwtPayload
    try {
      decoded = verifyToken(refreshToken) as JwtPayload
    } catch {
      throw new AppError(401, 'E004', 'Refresh token yaroqsiz yoki muddati tugagan')
    }

    // Foydalanuvchi hali ham active ekanligini tekshiramiz
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

  // 2-bosqich: OTP kodni tasdiqlash
  static async confirmOtp(userId: number, otp: string) {
    if (!userId || !otp) {
      throw new AppError(400, 'E002', 'Foydalanuvchi ID yoki OTP kodi yetarli emas')
    }

    // Mock OTP tekshiruvi
    if (otp !== '123456') {
      throw new AppError(400, 'E003', "Tasdiqlash kodi noto'g'ri")
    }

    // Foydalanuvchini bazadan tekshiramiz
    const user = await AuthRepository.findUserById(userId)
    if (!user || user.status !== 'active') {
      throw new AppError(404, 'E004', 'Foydalanuvchi topilmadi yoki faol emas')
    }

    // Payload yaratamiz (Prisma ID Int bo'lgani uchun userId raqam bo'ladi)
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
}
import { prisma } from '../config/prisma'

export class AuthRepository {
  // Telefon raqami bo'yicha foydalanuvchini topish yoki yangi ochish
  static async findOrCreateUser(phone: string) {
    // Agar foydalanuvchi bo'lsa topadi, bo'lmasa yangi yaratadi
    return prisma.user.upsert({
      where: { phone },
      update: {}, // Agar bor bo'lsa hech narsani o'zgartirmaydi
      create: {
        phone,
        status: 'active',
      },
    })
  }

  // ID bo'yicha foydalanuvchini topish
  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    })
  }
}
import { prisma } from '../config/prisma'

export class AuthRepository {
  static async findOrCreateUser(phone: string) {
    return prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        status: 'active',
      },
    })
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  static async updateUser(id: number, data: { name?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, phone: true, name: true, createdAt: true },
    })
  }
}

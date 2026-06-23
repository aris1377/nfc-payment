import { prisma } from '../config/prisma';

export class PaymentRepository {

  static async findHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [transactions, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          transactionId: true,
          ipayTransactionId: true,
          amount: true,
          currency: true,
          status: true,
          reason: true,
          createdAt: true,
          card: {
            select: {
              cardNumberMasked: true,
              maskedPhoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ])

    return { transactions, totalCount }
  }

  static async createTransaction(data: {
    transactionId: string;
    userId: number;
    cardId: number;
    amount: number;
    currency: string;
    status: string;
    reason?: string;
    ipayTransactionId?: number;
  }) {
    return prisma.transaction.create({
      data: {
        transactionId: data.transactionId,
        userId: data.userId,
        cardId: data.cardId,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        reason: data.reason,
        ipayTransactionId: data.ipayTransactionId,
      },
    });
  }

  static async findByTransactionId(transactionId: string) {
    return prisma.transaction.findUnique({
      where: { transactionId },
    });
  }
}
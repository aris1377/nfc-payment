import { prisma } from '../config/prisma'

export class MerchantRepository {
	static async create(data: {
		name: string
		login: string
		password: string
		vendorId?: number
		commission: number
		apiKey: string
	}) {
		return prisma.merchant.create({
			data: {
				name: data.name,
				login: data.login,
				password: data.password,
				vendorId: data.vendorId,
				commission: data.commission,
				apiKey: data.apiKey,
				status: 'active',
			},
			select: {
				id: true,
				uuid: true,

				name: true,
				login: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
			},
		})
	}

	static async findByLogin(login: string) {
		return prisma.merchant.findUnique({
			where: { login },
			select: {
				id: true,
				uuid: true,
				login: true,
				password: true,
				name: true,
				status: true,
			},
		})
	}

	static async findById(id: number) {
		return prisma.merchant.findUnique({
			where: { id },
			select: {
				id: true,
				uuid: true,

				name: true,
				login: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
				terminals: {
					select: {
						id: true,
						terminalIdFrom: true,
						serialNumber: true,
						status: true,
					},
				},
			},
		})
	}

	static async findAll(page: number, limit: number) {
		const skip = (page - 1) * limit

		const [merchants, totalCount] = await prisma.$transaction([
			prisma.merchant.findMany({
				select: {
					id: true,
					uuid: true,

					name: true,
					vendorId: true,
					commission: true,
					status: true,
					createdAt: true,
					terminals: {
						select: {
							id: true,
							terminalIdFrom: true,
							serialNumber: true,
							status: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.merchant.count(),
		])

		return { merchants, totalCount }
	}

	static async findByUuid(uuid: string) {
		return prisma.merchant.findUnique({
			where: { uuid },
			select: {
				id: true,
				uuid: true,

				name: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
				terminals: {
					select: {
						id: true,
						terminalIdFrom: true,
						serialNumber: true,
						status: true,
					},
				},
			},
		})
	}

	static async update(
		uuid: string,
		data: {
			name?: string
			vendorId?: number
			commission?: number
			status?: string
		},
	) {
		return prisma.merchant.update({
			where: { uuid },
			data,
			select: {
				id: true,
				uuid: true,

				name: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
			},
		})
	}

	static async getDailyRevenue(page: number, limit: number) {
		const skip = (page - 1) * limit
		const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

		const whereClause = {
			createdAt: { gte: since },
			status: 'approved',
			merchantId: { not: null },
		}

		// Pagination bilan guruhlar
		const pagedGroups = await prisma.transaction.groupBy({
			by: ['merchantId'],
			where: whereClause,
			_sum: { amount: true },
			_count: { id: true },
			orderBy: { _sum: { amount: 'desc' } },
			skip,
			take: limit,
		})

		// Umumiy merchant soni (distinct)
		const allMerchantIds = await prisma.transaction.findMany({
			where: whereClause,
			distinct: ['merchantId'],
			select: { merchantId: true },
		})
		const totalCount = allMerchantIds.length

		if (pagedGroups.length === 0) {
			return { dailyRevenue: [], totalCount }
		}

		const merchantIds = pagedGroups.map(g => g.merchantId as number)
		const merchants = await prisma.merchant.findMany({
			where: { id: { in: merchantIds } },
			select: { id: true, uuid: true, name: true },
		})

		const merchantMap = new Map(merchants.map(m => [m.id, m]))

		const dailyRevenue = pagedGroups.map(g => {
			const merchant = merchantMap.get(g.merchantId as number)
			const totalTiyin = g._sum.amount ?? 0
			return {
				merchantId: merchant?.uuid ?? null,
				merchantName: merchant?.name ?? null,
				totalTiyin,
				totalSom: totalTiyin / 100,
				transactionCount: g._count.id,
			}
		})

		return { dailyRevenue, totalCount }
	}

	static async findRevByUuid(uuid: string) {
		const merchant = await prisma.merchant.findUnique({
			where: { uuid },
			select: { id: true, uuid: true, name: true },
		})

		if (!merchant) return null

		const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

		const result = await prisma.transaction.aggregate({
			where: {
				merchantId: merchant.id,
				createdAt: { gte: since },
				status: 'approved',
			},
			_sum: { amount: true },
			_count: { id: true },
		})

		const dailyAmount = result._sum.amount ?? 0

		return {
			merchantId: merchant.uuid,
			merchantName: merchant.name,
			dailyAmount,
			dailyTransactions: result._count.id,
		}
	}

	static async createTerminal(data: {
		merchantId: number
		serialNumber: string
	}) {
		return prisma.terminal.create({
			data: {
				merchantId: data.merchantId,
				terminalIdFrom: `TERM_${Date.now()}`,
				serialNumber: data.serialNumber,
				status: 'active',
			},
			select: {
				id: true,
				terminalIdFrom: true,
				serialNumber: true,
				status: true,
				createdAt: true,
			},
		})
	}
}

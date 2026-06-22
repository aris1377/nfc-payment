import { prisma } from '../config/prisma'

export class MerchantRepository {
	static async create(data: {
		name: string
		vendorId?: number
		commission: number
		apiKey: string
	}) {
		return prisma.merchant.create({
			data: {
				merchantIdFrom: `MERCH_${Date.now()}`,
				name: data.name,
				vendorId: data.vendorId,
				commission: data.commission,
				apiKey: data.apiKey,
				status: 'active',
			},
			select: {
				id: true,
				uuid: true,
				merchantIdFrom: true,
				name: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
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
					merchantIdFrom: true,
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
				merchantIdFrom: true,
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
				merchantIdFrom: true,
				name: true,
				vendorId: true,
				commission: true,
				status: true,
				createdAt: true,
			},
		})
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

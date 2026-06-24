/// <reference types="node" />
import { prisma } from '../src/config/prisma'

async function seed() {
	console.log('🌱 Seed jarayoni boshlandi...')

	// Foydalanuvchi
	const user = await prisma.user.upsert({
		where: { phone: '+998917910502' },
		update: {},
		create: {
			phone: '+998917910502',
			name: 'Bekzod Begaliev',
			status: 'active',
		},
	})
	console.log('✅ User yaratildi:', user.id, user.phone)

	// Merchant
	const merchant = await prisma.merchant.upsert({
		where: { login: 'testmerchant' },
		update: {},
		create: {
			name: 'Test Do\'kon',
			login: 'testmerchant',
			password: '$2b$10$placeholder.hashed.password',
			apiKey: 'test-api-key-001',
			status: 'active',
		},
	})
	console.log('✅ Merchant yaratildi:', merchant.id, merchant.name)

	// Terminal
	const terminal = await prisma.terminal.upsert({
		where: { terminalIdFrom: 'TERM_4521' },
		update: {},
		create: {
			merchantId: merchant.id,
			terminalIdFrom: 'TERM_4521',
			serialNumber: 'SN-0001',
			status: 'active',
		},
	})
	console.log('✅ Terminal yaratildi:', terminal.id, terminal.terminalIdFrom)

	console.log('🎉 Seed muvaffaqiyatli yakunlandi!')
}

seed()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error('❌ Seed-da xatolik yuz berdi:', e)
		await prisma.$disconnect()
		process.exit(1)
	})

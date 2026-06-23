import axios from 'axios'
import { generateAuthKeyHelper } from '../utils/auth-key.helper'

// Axios instansini yaratamiz
const ipayClient = axios.create({
	baseURL: process.env.IPAY_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// REQUEST INTERCEPTOR: Har bitta so'rov ketishidan oldin dinamik Auth token generatsiya qiladi
ipayClient.interceptors.request.use(
	config => {
		const dynamicAuthToken = generateAuthKeyHelper()
		if (config.headers) {
			config.headers['Auth'] = dynamicAuthToken
		}
		return config
	},
	error => {
		return Promise.reject(error)
	},
)

export class IpayService {
	private static generateRpcId(): number {
		return Math.floor(Math.random() * 1000) + 1
	}

	// 1. Karta ro'yxatdan o'tkazish so'rovi (ipay.card_registration)
	static async registerCard(
		phoneNumber: string,
		cardNumber: string,
		cardExpire: string,
	) {
		const response = await ipayClient.post('', {
			method: 'ipay.card_registration',
			params: {
				phone_number: phoneNumber,
				card_number: cardNumber,
				card_expire: cardExpire,
			},
			id: this.generateRpcId(),
		})
		return response.data
	}

	// 2. Kartani OTP bilan tasdiqlash (ipay.card_confirm)
	static async confirmCard(cardIdFromBank: string, confirmationCode: string) {
		const response = await ipayClient.post('', {
			method: 'ipay.card_confirm',
			params: {
				card_id: cardIdFromBank,
				confirmation_code: confirmationCode,
			},
			id: this.generateRpcId(),
		})
		return response.data
	}

	// 3. Kartalar ma'lumotini yangilash/olish (ipay.cards_info)
	static async getCardsInfo(cardIds: string[]) {
		const response = await ipayClient.post('', {
			method: 'ipay.cards_info',
			params: { card_ids: cardIds },
			id: this.generateRpcId(),
		})
		return response.data
	}

	// 4. Kartani bloklash (ipay.card_block)
	static async blockCard(cardIdFromBank: string) {
		const response = await ipayClient.post('', {
			method: 'ipay.card_block',
			params: { card_id: cardIdFromBank },
			id: this.generateRpcId(),
		})
		return response.data
	}

	// 5. Chek tafsilotlarini olish (pam.get_cheque_details)
	static async getChequeDetails(transactionId: number) {
		const response = await ipayClient.post('', {
			id: this.generateRpcId(),
			method: 'pam.get_cheque_details',
			params: { transaction_id: transactionId },
		})
		return response.data
	}

	// 6. Chekni olish (pam.get_cheque)
	static async getCheque(transactionId: number) {
		const response = await ipayClient.post('', {
			id: this.generateRpcId(),
			method: 'pam.get_cheque',
			params: { transaction_id: transactionId },
		})
		return response.data
	}
	
	static async chargeCard(cardId: string, cardToken: string, amount: number) {
		const vendorId = Number(process.env.IPAY_VENDOR_ID)
		const account = Number(process.env.IPAY_ACCOUNT)

		const requestBody = {
			id: this.generateRpcId(),
			method: 'pam.pay_by_id',
			params: {
				vendor_form: { amount, vendor_id: vendorId, account },
				pay_form: { card_id: cardId },
			},
		}

		const response = await ipayClient.post(
			'',
			requestBody,
			{
				timeout: 30000,
				headers: {
					'Card-Token': cardToken,
				},
			},
		)

		return response.data
	}
}

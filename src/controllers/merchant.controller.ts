import { Request, Response, NextFunction } from 'express'
import { MerchantService } from '../services/merchant.service'
import { MerchantRequest } from '../middlewares/merchant-auth.middleware'

export class MerchantController {
	static async create(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.createMerchant(req.body)
			return res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}

	static async list(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.getMerchants(req.query)
			return res.status(200).json({ status: 'success', ...result })
		} catch (error) {
			next(error)
		}
	}

	static async get(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.getMerchant(
				req.params.uuid as string,
			)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	static async update(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.updateMerchant(
				req.params.uuid as string,
				req.body,
			)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	static async getDailyRevByUuid(
		req: MerchantRequest,
		res: Response,
		next: NextFunction,
	) {
		try {
			const result = await MerchantService.getRevByUuid(req.merchantUuid!)
			return res.status(200).json({ status: 'success', ...result })
		} catch (error) {
			next(error)
		}
	}

	static async getDailyRevenue(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const result = await MerchantService.getDailyRevenue(req.query)
			return res.status(200).json({ status: 'success', ...result })
		} catch (error) {
			next(error)
		}
	}

	static async createTerminal(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.createTerminal(
				req.params.uuid as string,
				req.body,
			)
			return res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}
}

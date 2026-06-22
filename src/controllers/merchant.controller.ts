import { Request, Response, NextFunction } from 'express'
import { MerchantService } from '../services/merchant.service'

export class MerchantController {
	// POST /api/admin/merchants
	static async create(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.createMerchant(req.body)
			return res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}

	// GET /api/admin/merchants
	static async list(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await MerchantService.getMerchants(req.query)
			return res.status(200).json({
				status: 'success',
				...result,
			})
		} catch (error) {
			next(error)
		}
	}

	// GET /api/admin/merchants/:uuid
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

	// PATCH /api/admin/merchants/:uuid
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

	// POST /api/admin/merchants/:uuid/terminals
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

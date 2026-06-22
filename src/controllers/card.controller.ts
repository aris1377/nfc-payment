import { Response, NextFunction } from 'express'
// Standart Request o'rniga o'zimizning AuthenticatedRequest interfeysini olib kelamiz
import { AuthenticatedRequest } from '../middlewares/auth.middleware' 
import { CardService } from '../services/card.service'

export class CardController {
	
	// POST /api/v1/cards/register (Prepare)
	static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId! 
			const result = await CardService.prepareRegistration(userId, req.body)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	// POST /api/v1/cards/confirm (Confirm)
	static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId!	
			const result = await CardService.confirmRegistration(userId, req.body)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	// GET /api/v1/cards (Get list)
	static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId!
			const result = await CardService.getUserCards(userId, req.query)
			return res.status(200).json({
				status: 'success',
				...result, 
			})
		} catch (error) {
			next(error)
		}
	}

	// GET /api/v1/cards/:id (Get)
	static async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId!
			const cardIdStr = req.params.id as string
			const cardId = parseInt(cardIdStr, 10)
			const result = await CardService.getCard(userId, cardId)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	// DELETE /api/v1/cards/:id (Delete)
	static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId!
			const cardIdStr = req.params.id as string
			const cardId = parseInt(cardIdStr, 10)
			const result = await CardService.removeCard(userId, cardId)
			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}

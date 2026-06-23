import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { CardService } from '../services/card.service'

export class CardController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const result = await CardService.prepareRegistration(userId, req.body)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const result = await CardService.confirmRegistration(userId, req.body)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const result = await CardService.getUserCards(userId, req.query)
      return res.status(200).json({ status: 'success', ...result })
    } catch (error) {
      next(error)
    }
  }

  static async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const cardId = parseInt(req.params.id as string, 10)
      const result = await CardService.getCard(userId, cardId)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!
      const cardId = parseInt(req.params.id as string, 10)
      const result = await CardService.removeCard(userId, cardId)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

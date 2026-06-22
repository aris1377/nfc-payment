import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../utils/app-error';

export class PaymentController {
  // GET /api/payment/history
  static async history(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'E004', 'Foydalanuvchi aniqlanmadi');
      }

      const result = await PaymentService.getHistory(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payment/nfc
  static async nfcPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'E004', 'Foydalanuvchi aniqlanmadi');
      }

      const result = await PaymentService.initiateNfcPayment(userId, req.body);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
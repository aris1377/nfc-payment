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

  // GET /api/payment/cheque/:transactionId
  static async getChequeDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ipayTransactionId = Number(req.params.transactionId)

      if (isNaN(ipayTransactionId) || ipayTransactionId <= 0) {
        throw new AppError(400, 'E001', 'iPay Transaction ID to\'g\'ri raqam bo\'lishi kerak')
      }

      const result = await PaymentService.getChequeDetails(ipayTransactionId)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/payment/cheque-simple/:transactionId
  static async getCheque(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ipayTransactionId = Number(req.params.transactionId)

      if (isNaN(ipayTransactionId) || ipayTransactionId <= 0) {
        throw new AppError(400, 'E001', 'iPay Transaction ID to\'g\'ri raqam bo\'lishi kerak')
      }

      const result = await PaymentService.getCheque(ipayTransactionId)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
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
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/app-error'

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-admin-key']

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    throw new AppError(401, 'E004', 'Admin huquqi talab qilinadi')
  }

  next()
}

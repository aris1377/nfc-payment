import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/app-error'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    })
    return
  }

  console.error('[Unhandled Error]', err)
  res.status(500).json({
    success: false,
    errorCode: 'E500',
    message: 'Ichki server xatoligi',
  })
}

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface MerchantRequest extends Request {
  merchantUuid?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret-access-key'

export const merchantAuth = (req: MerchantRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { merchantUuid: string; role: string }

    if (decoded.role !== 'merchant') {
      res.status(403).json({ success: false, message: 'Forbidden.' })
      return
    }

    req.merchantUuid = decoded.merchantUuid
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}

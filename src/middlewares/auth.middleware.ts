import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Express Request interfeysini kengaytiramiz (req.userId ni tanishi uchun)
export interface AuthenticatedRequest extends Request {
  userId?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret-access-key'

export const authentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    return
  }

  try {
    // Tokenni tekshiramiz
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role?: string }
    
    // Prisma sxemasida id Int bo'lgani uchun raqamga o'giramiz
    req.userId = Number(decoded.userId) 
    
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}
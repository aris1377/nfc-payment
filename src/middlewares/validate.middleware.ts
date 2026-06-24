import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { Request, Response, NextFunction } from 'express'

export const validateBody = (DtoClass: new () => object) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body)
    const errors = await validate(instance, { whitelist: true })

    if (errors.length > 0) {
      const message = Object.values(errors[0].constraints ?? {})[0]
      res.status(400).json({ success: false, errorCode: 'E001', message })
      return
    }

    req.body = instance
    next()
  }

import express, { Application } from 'express'
import cors from 'cors'
import rootRouter from './routes/index'
import { errorHandler } from './middlewares/error.middleware'

const app: Application = express()

app.use(cors())
app.use(express.json())

app.use('/api', rootRouter)

app.use(errorHandler)

export default app
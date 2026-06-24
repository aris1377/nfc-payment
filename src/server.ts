import 'reflect-metadata'
import 'dotenv/config'
import http from 'http'
import app from './app'
import { SocketService } from './services/socket.service'

const PORT = Number(process.env.PORT) || 3001

const httpServer = http.createServer(app)
SocketService.init(httpServer)

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`server connected: http://localhost:${PORT}`)
})

export default httpServer
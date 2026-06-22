import 'dotenv/config'
import http from 'http'
import app from './app'
import { SocketService } from './services/socket.service'

const PORT = Number(process.env.PORT) || 3000

const httpServer = http.createServer(app)
SocketService.init(httpServer)

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`)
  console.log(`🌐 Tarmoqdan: http://10.20.30.30:${PORT}`)
})

export default httpServer
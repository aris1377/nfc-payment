import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '../config/prisma';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static init(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Terminal ulandi. Socket ID: ${socket.id}`);

      // 1. Terminal ro'yxatdan o'tishi (terminal:register)
      socket.on('terminal:register', async (raw: any) => {
        try {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

          if (!data?.terminalIdFrom) {
            socket.emit('terminal:registered', { status: 'error', reason: 'terminalIdFrom majburiy' });
            return;
          }

          const terminal = await prisma.terminal.findUnique({
            where: { terminalIdFrom: data.terminalIdFrom },
          });

          if (!terminal) {
            socket.emit('payment_result', { status: 'declined', reason: 'terminal_not_found', errorCode: 'E006' });
            return;
          }

          // Eski faol sessiyalarni o'chiramiz
          await prisma.socketSession.updateMany({
            where: { terminalId: terminal.id, status: 'active' },
            data: { status: 'inactive' },
          });

          // Yangi socket sessiya yaratamiz (24 soat amal qiladi)
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          await prisma.socketSession.create({
            data: {
              terminalId: terminal.id,
              socketId: socket.id,
              status: 'active',
              expiresAt,
            },
          });

          // Terminal o'z socket.id nomi bilan ochilgan xonaga (room) kiradi
          socket.join(socket.id);
          console.log(`Terminal ${data.terminalIdFrom} roomga qo'shildi: ${socket.id}`);

          // Terminalga muvaffaqiyatli ulanganini va socketId'ni xabar qilamiz
          socket.emit('terminal:registered', {
            status: 'ok',
            socketId: socket.id,
          });
        } catch (error) {
          console.error('Terminal registerda xatolik:', error);
        }
      });

      // 2. Heartbeat (Ulanishni ushlab turish)
      socket.on('terminal:heartbeat', () => {
        socket.emit('terminal:heartbeat', { status: 'pong' });
      });

      // 3. Aloqa uzilganda (Disconnect)
      socket.on('disconnect', async () => {
        console.log(`Terminal uzildi: ${socket.id}`);
        await prisma.socketSession.updateMany({
          where: { socketId: socket.id },
          data: { status: 'inactive' },
        });
      });
    });

    return this.io;
  }

  // Tashqi tomondan (Controllerdan) turib ma'lum bir terminal xonasiga xabar yuborish funksiyasi
  public static emitToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }
}
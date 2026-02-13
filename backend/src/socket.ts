import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import { logger } from './utils/logger';
import { env } from './config/env';
import { chatService } from './services/chatService';

let io: Server;

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function initializeSocket(server: HttpServer): void {
  io = new Server(server, {
    cors: {
      origin: [env.frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.userId;
    logger.info(`Socket connected: ${userId}`);

    // Join personal room for targeted messages
    socket.join(`user:${userId}`);

    // Client sends a message (text and/or file)
    socket.on('send_message', async (data: {
      chatId: string;
      content?: string;
      messageType?: 'TEXT' | 'IMAGE' | 'FILE';
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      try {
        const message = await chatService.sendMessage({
          chatId: data.chatId,
          senderId: userId,
          content: data.content,
          messageType: data.messageType,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
        });

        // Broadcast to all participants
        const participantIds = await chatService.getChatParticipantUserIds(data.chatId);
        participantIds.forEach((participantUserId) => {
          io.to(`user:${participantUserId}`).emit('new_message', message);
        });
      } catch (error) {
        logger.error('Error sending message via socket', { error });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Client opens a chat (mark as read)
    socket.on('join_chat', async (chatId: string) => {
      try {
        await chatService.markChatAsRead(chatId, userId);
        socket.emit('unread_updated', { chatId, unreadCount: 0 });
      } catch (error) {
        logger.error('Error joining chat', { error });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });
}

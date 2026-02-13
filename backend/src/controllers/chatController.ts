import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chatService';
import { storageService } from '../services/storageService';
import { prisma } from '../config/database';
import { getIO } from '../socket';

export const chatController = {
  async getChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.getUserChats(req.user!.userId);
      res.json({ success: true, data: chats });
    } catch (error) {
      next(error);
    }
  },

  async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.isGroup) {
        const chat = await chatService.createGroupChat({
          createdById: req.user!.userId,
          name: req.body.name,
          participantIds: req.body.participantIds,
        });
        res.status(201).json({ success: true, data: chat });
      } else {
        const chat = await chatService.findOrCreateChat(req.user!.userId, req.body.participantId);
        res.status(201).json({ success: true, data: chat });
      }
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 50;
      const messages = await chatService.getMessages(req.params.chatId as string, req.user!.userId, page, perPage);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await chatService.sendMessage({
        chatId: req.params.chatId as string,
        senderId: req.user!.userId,
        content: req.body.content,
        messageType: req.body.messageType,
        fileUrl: req.body.fileUrl,
        fileName: req.body.fileName,
        fileSize: req.body.fileSize ? parseInt(req.body.fileSize) : undefined,
      });
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  },

  async uploadChatFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file provided' });
        return;
      }

      const chatId = req.params.chatId as string;
      const participant = await prisma.chatParticipant.findUnique({
        where: { chatId_userId: { chatId, userId: req.user!.userId } },
      });
      if (!participant) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const isImage = file.mimetype.startsWith('image/');
      const folder = isImage ? 'chat-images' : 'chat-files';
      const result = await storageService.uploadToGCS(file, folder);

      res.json({
        success: true,
        data: {
          fileUrl: result.url,
          fileKey: result.key,
          fileName: file.originalname,
          fileSize: file.size,
          messageType: isImage ? 'IMAGE' : 'FILE',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await chatService.markChatAsRead(req.params.chatId as string, req.user!.userId);
      res.json({ success: true, message: 'Chat marked as read' });
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await chatService.getAvailableUsers(req.user!.userId);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  async getGroupDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await chatService.getGroupDetails(req.params.chatId as string, req.user!.userId);
      res.json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  },

  async addParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string;
      const result = await chatService.addGroupParticipant(
        chatId,
        req.user!.userId,
        req.body.userId
      );

      // Notify all participants
      const io = getIO();
      const participantIds = await chatService.getChatParticipantUserIds(chatId);
      participantIds.forEach((pid) => {
        io.to(`user:${pid}`).emit('group_updated', { chatId, action: 'participant_added', userId: req.body.userId });
      });
      io.to(`user:${req.body.userId}`).emit('group_updated', { chatId, action: 'added_to_group' });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async removeParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string;
      const targetUserId = req.params.userId as string;
      await chatService.removeGroupParticipant(chatId, req.user!.userId, targetUserId);

      // Notify remaining participants and the removed user
      const io = getIO();
      const participantIds = await chatService.getChatParticipantUserIds(chatId);
      participantIds.forEach((pid) => {
        io.to(`user:${pid}`).emit('group_updated', { chatId, action: 'participant_removed', userId: targetUserId });
      });
      io.to(`user:${targetUserId}`).emit('group_updated', { chatId, action: 'removed_from_group' });

      res.json({ success: true, message: 'Participant removed' });
    } catch (error) {
      next(error);
    }
  },
};

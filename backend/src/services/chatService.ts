import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const chatService = {
  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return chats.map((chat) => {
      const myParticipant = chat.participants.find((p) => p.userId === userId);
      const lastMessage = chat.messages[0] || null;

      if (chat.isGroup) {
        return {
          id: chat.id,
          isGroup: true,
          name: chat.name,
          participants: chat.participants.map((p) => p.user),
          otherUser: null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                messageType: lastMessage.messageType,
                senderId: lastMessage.senderId,
                senderName: lastMessage.sender.name,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount: myParticipant?.unreadCount || 0,
          updatedAt: chat.updatedAt,
        };
      }

      const otherParticipant = chat.participants.find((p) => p.userId !== userId);
      return {
        id: chat.id,
        isGroup: false,
        name: null,
        participants: null,
        otherUser: otherParticipant?.user || null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              messageType: lastMessage.messageType,
              senderId: lastMessage.senderId,
              senderName: lastMessage.sender.name,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount: myParticipant?.unreadCount || 0,
        updatedAt: chat.updatedAt,
      };
    });
  },

  async findOrCreateChat(userId: string, participantId: string) {
    if (userId === participantId) {
      throw new AppError('Cannot create chat with yourself', 400);
    }

    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    if (!participant || !participant.isActive) {
      throw new AppError('User not found', 404);
    }

    // Find existing 1-on-1 chat between these two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
    });

    if (existingChat) {
      return {
        id: existingChat.id,
        otherUser: { id: participant.id, name: participant.name, email: participant.email, role: participant.role },
        isNew: false,
      };
    }

    const chat = await prisma.chat.create({
      data: {
        type: 'ONE_ON_ONE',
        isGroup: false,
        createdById: userId,
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
    });

    return {
      id: chat.id,
      otherUser: { id: participant.id, name: participant.name, email: participant.email, role: participant.role },
      isNew: true,
    };
  },

  async createGroupChat(data: { createdById: string; name: string; participantIds: string[] }) {
    if (data.participantIds.length < 2) {
      throw new AppError('Group chat requires at least 2 other participants', 400);
    }

    const allParticipantIds = Array.from(new Set([data.createdById, ...data.participantIds]));

    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantIds }, isActive: true },
      select: { id: true },
    });
    if (users.length !== allParticipantIds.length) {
      throw new AppError('One or more users not found', 404);
    }

    const chat = await prisma.chat.create({
      data: {
        type: 'GROUP',
        isGroup: true,
        name: data.name,
        createdById: data.createdById,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
            role: id === data.createdById ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    return {
      id: chat.id,
      isGroup: true,
      name: chat.name,
      participants: chat.participants.map((p) => ({
        ...p.user,
        participantRole: p.role,
      })),
      isNew: true,
    };
  },

  async getGroupDetails(chatId: string, userId: string) {
    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) throw new AppError('Access denied', 403);

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    if (!chat || !chat.isGroup) throw new AppError('Group not found', 404);

    return {
      id: chat.id,
      name: chat.name,
      createdById: chat.createdById,
      participants: chat.participants.map((p) => ({
        ...p.user,
        participantRole: p.role,
        joinedAt: p.joinedAt,
      })),
    };
  },

  async addGroupParticipant(chatId: string, requesterId: string, newUserId: string) {
    const requester = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: requesterId } },
    });
    if (!requester || requester.role !== 'ADMIN') {
      throw new AppError('Only group admins can add participants', 403);
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat?.isGroup) throw new AppError('Not a group chat', 400);

    const user = await prisma.user.findUnique({
      where: { id: newUserId, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new AppError('User not found', 404);

    const existing = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: newUserId } },
    });
    if (existing) throw new AppError('User is already a participant', 400);

    const created = await prisma.chatParticipant.create({
      data: { chatId, userId: newUserId, role: 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    return created;
  },

  async removeGroupParticipant(chatId: string, requesterId: string, targetUserId: string) {
    const requester = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId: requesterId } },
    });
    if (!requester || requester.role !== 'ADMIN') {
      throw new AppError('Only group admins can remove participants', 403);
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat?.isGroup) throw new AppError('Not a group chat', 400);
    if (targetUserId === chat.createdById) {
      throw new AppError('Cannot remove the group creator', 400);
    }

    return prisma.chatParticipant.delete({
      where: { chatId_userId: { chatId, userId: targetUserId } },
    });
  },

  async getMessages(chatId: string, userId: string, page: number, perPage: number) {
    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) throw new AppError('Access denied', 403);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        include: {
          sender: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    return {
      items: messages.reverse(),
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  },

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    content?: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    const participant = await prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId: data.chatId, userId: data.senderId } },
    });
    if (!participant) throw new AppError('Access denied', 403);

    if (!data.content && !data.fileUrl) {
      throw new AppError('Message must have content or a file', 400);
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content || null,
          messageType: data.messageType || 'TEXT',
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      }),
      prisma.chat.update({
        where: { id: data.chatId },
        data: { updatedAt: new Date() },
      }),
      prisma.chatParticipant.updateMany({
        where: {
          chatId: data.chatId,
          userId: { not: data.senderId },
        },
        data: { unreadCount: { increment: 1 } },
      }),
    ]);

    return message;
  },

  async markChatAsRead(chatId: string, userId: string) {
    await prisma.chatParticipant.updateMany({
      where: { chatId, userId },
      data: { unreadCount: 0 },
    });
  },

  async getChatParticipantUserIds(chatId: string): Promise<string[]> {
    const participants = await prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  },

  async getAvailableUsers(currentUserId: string) {
    return prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  },
};

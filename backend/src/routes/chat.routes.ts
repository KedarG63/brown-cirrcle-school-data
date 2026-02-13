import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { chatUploadSingle } from '../middleware/upload';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const createChatSchema = z.object({
  // 1-on-1
  participantId: z.string().uuid().optional(),
  // Group
  isGroup: z.boolean().optional(),
  name: z.string().min(1).max(100).optional(),
  participantIds: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    if (data.isGroup) return !!data.name && !!data.participantIds && data.participantIds.length >= 2;
    return !!data.participantId;
  },
  { message: 'Provide participantId for 1-on-1, or isGroup + name + participantIds (min 2) for group' }
);

const sendMessageSchema = z.object({
  content: z.string().max(5000).optional(),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
}).refine(
  (data) => !!data.content || !!data.fileUrl,
  { message: 'Message must have content or a file' }
);

const addParticipantSchema = z.object({
  userId: z.string().uuid(),
});

// GET /api/chats/users/list - Get available users (must be before /:chatId)
router.get('/users/list', chatController.getUsers);

// GET /api/chats - Get all chats for current user
router.get('/', chatController.getChats);

// POST /api/chats - Create or get existing chat (1-on-1 or group)
router.post('/', validate(createChatSchema), chatController.createChat);

// GET /api/chats/:chatId/messages - Get messages for a chat (paginated)
router.get('/:chatId/messages', chatController.getMessages);

// POST /api/chats/:chatId/messages - Send a message (REST fallback)
router.post('/:chatId/messages', validate(sendMessageSchema), chatController.sendMessage);

// POST /api/chats/:chatId/upload - Upload a file for chat
router.post('/:chatId/upload', chatUploadSingle, chatController.uploadChatFile);

// PUT /api/chats/:chatId/read - Mark chat as read
router.put('/:chatId/read', chatController.markAsRead);

// GET /api/chats/:chatId/details - Get group details
router.get('/:chatId/details', chatController.getGroupDetails);

// POST /api/chats/:chatId/participants - Add member to group
router.post('/:chatId/participants', validate(addParticipantSchema), chatController.addParticipant);

// DELETE /api/chats/:chatId/participants/:userId - Remove member from group
router.delete('/:chatId/participants/:userId', chatController.removeParticipant);

export default router;

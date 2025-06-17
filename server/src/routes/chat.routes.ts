import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../config/multerConfig';

const chatController = new ChatController();

const chatRoute = express.Router();

// Routes for chat functionality
chatRoute.post('/chatrooms', authMiddleware, chatController.createChatRoom);
chatRoute.post('/messages', authMiddleware,  chatController.sendMessage);
chatRoute.post('/upload', authMiddleware, upload.array('mediaFiles'), chatController.uploadMedia);
chatRoute.get('/messages/:chatId', authMiddleware, chatController.getMessages);
chatRoute.get('/chatrooms/:userId', authMiddleware, chatController.getChatRoomsForUser);

export { chatRoute, chatController };

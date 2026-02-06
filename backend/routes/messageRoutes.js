import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createMessage,
  getMessages,
  getConversations,
  getUserConversations,
  startConversation, 
  markConversationRead
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, createMessage);
router.post('/conversations', protect, startConversation);
router.get('/conversations/:userId', protect, getConversations);
router.get('/conversations', protect, getUserConversations);

router.put('/:id/read', protect, markConversationRead);

router.get('/:conversationId', protect, getMessages);

export default router;
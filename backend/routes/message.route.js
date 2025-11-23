import express from 'express';
import { sendMessage, getConversationMessages } from '../controllers/message.controller.js';

const router = express.Router();

// Send a message
router.post('/', sendMessage);

// Get messages for a conversation
router.get('/:conversationId', getConversationMessages);

export default router;

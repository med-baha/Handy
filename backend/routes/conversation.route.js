import express from 'express';
import { createOrGetConversation, getUserConversations } from '../controllers/conversation.controller.js';

const router = express.Router();

// Create or get conversation
router.post('/', createOrGetConversation);

// Get all conversations for user
router.get('/', getUserConversations);

export default router;

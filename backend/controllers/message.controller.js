import Message from "../models/Messages.js";
import Conversation from "../models/Conversations.js";
import User from "../models/User.js";
import { getAuth } from "@clerk/express";

// Send a message in a conversation
export const sendMessage = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        const { conversationId, content } = req.body;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!conversationId || !content) {
            return res.status(400).json({ message: "Conversation ID and content are required" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUserId = currentUser._id;

        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(currentUserId)) {
            return res.status(403).json({ message: "You are not a participant in this conversation" });
        }

        // Create message
        const newMessage = await Message.create({
            conversation: conversationId,
            sender: currentUserId,
            content: content.trim()
        });

        // Update conversation's updatedAt timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

        // Populate and return
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'name profilepic clerk_id');

        return res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all messages for a conversation
export const getConversationMessages = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        const { conversationId } = req.params;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(currentUser._id)) {
            return res.status(403).json({ message: "You are not a participant in this conversation" });
        }

        // Get messages
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name profilepic clerk_id')
            .sort({ createdAt: 1 }); // Oldest first

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getConversationMessages:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

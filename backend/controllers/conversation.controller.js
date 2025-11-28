import Conversation from "../models/Conversations.js";
import User from "../models/User.js";
import Message from "../models/Messages.js";
import { getAuth } from "@clerk/express";

// Create or get existing conversation between two users
export const createOrGetConversation = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        const { otherUserId } = req.body;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!otherUserId) {
            return res.status(400).json({ message: "Other user ID is required" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUserId = currentUser._id;

        // Check if conversation already exists between these two users
        const existingConversation = await Conversation.findOne({
            participants: { $all: [currentUserId, otherUserId] }
        }).populate('participants', 'name profilepic clerk_id');

        if (existingConversation) {
            return res.status(200).json({
                ...existingConversation.toObject(),
                isExisting: true
            });
        }

        // Create new conversation
        const newConversation = await Conversation.create({
            participants: [currentUserId, otherUserId]
        });

        // Populate and return
        const populatedConversation = await Conversation.findById(newConversation._id)
            .populate('participants', 'name profilepic clerk_id');

        return res.status(201).json({
            ...populatedConversation.toObject(),
            isExisting: false
        });
    } catch (error) {
        console.error("Error in createOrGetConversation:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all conversations for the authenticated user
export const getUserConversations = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use the MongoDB _id of the authenticated user
        const conversations = await Conversation.find({
            participants: currentUser._id
        })
            .populate('participants', 'name profilepic is_handy')
            .sort({ updatedAt: -1 });

        return res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getUserConversations:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

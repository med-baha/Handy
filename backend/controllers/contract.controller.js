import Contract from "../models/Contract.js";
import User from "../models/User.js";
import { getAuth } from "@clerk/express";

// Create a new contract proposal
export const createContractProposal = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        const {
            receiverId,
            conversationId,
            title,
            description,
            price,
            deadline,
            location,
            estimatedHours,
            paymentTerms
        } = req.body;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate required fields
        if (!receiverId || !conversationId || !title || !description || !price || !deadline || !location || !estimatedHours || !paymentTerms) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if receiver is a handy
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        if (!receiver.is_handy) {
            return res.status(400).json({ message: "Can only create contracts with handys" });
        }

        // Create new contract proposal
        const newContract = await Contract.create({
            sender: currentUser._id,
            receiver: receiverId,
            conversationId,
            title,
            description,
            price,
            deadline,
            location,
            estimatedHours,
            paymentTerms,
            status: 'pending'
        });

        // Populate sender and receiver details
        const populatedContract = await Contract.findById(newContract._id)
            .populate('sender', 'name profilepic clerk_id specialty')
            .populate('receiver', 'name profilepic clerk_id specialty');

        return res.status(201).json(populatedContract);
    } catch (error) {
        console.error("Error in createContractProposal:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all contracts for the authenticated user (both sent and received)
export const getUserContracts = async (req, res) => {
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

        // Get all contracts where user is sender or receiver
        const contracts = await Contract.find({
            $or: [
                { sender: currentUser._id },
                { receiver: currentUser._id }
            ]
        })
            .populate('sender', 'name profilepic clerk_id specialty')
            .populate('receiver', 'name profilepic clerk_id specialty')
            .sort({ createdAt: -1 });

        return res.status(200).json(contracts);
    } catch (error) {
        console.error("Error in getUserContracts:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update contract status (accept or reject) - only receiver can do this
export const updateContractStatus = async (req, res) => {
    try {
        const { userId: clerkId } = getAuth(req);
        const { id } = req.params;
        const { status } = req.body;

        if (!clerkId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate status
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
        }

        // Get current user's MongoDB _id from their Clerk ID
        const currentUser = await User.findOne({ clerk_id: clerkId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the contract
        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ message: "Contract not found" });
        }

        // Check if current user is the receiver
        if (contract.receiver.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ message: "Only the receiver can accept or reject a contract" });
        }

        // Check if contract is still pending
        if (contract.status !== 'pending') {
            return res.status(400).json({ message: "Contract has already been processed" });
        }

        // Update status
        contract.status = status;
        await contract.save();

        // Populate and return updated contract
        const updatedContract = await Contract.findById(contract._id)
            .populate('sender', 'name profilepic clerk_id specialty')
            .populate('receiver', 'name profilepic clerk_id specialty');

        return res.status(200).json(updatedContract);
    } catch (error) {
        console.error("Error in updateContractStatus:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

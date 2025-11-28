import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from "./routes/user.route.js";
import webHookRouter from "./routes/webhook.rout.js";
import postRouter from "./routes/post.route.js";
import conversationRouter from "./routes/conversation.route.js";
import messageRouter from "./routes/message.route.js";
import contractRouter from "./routes/contract.route.js";
import User from "./models/User.js";

dotenv.config({ path: '.env.local' });

const app = express();
const httpServer = createServer(app);

// ✅ Configure Socket.IO with CORS
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Enable CORS for your frontend
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(clerkMiddleware());

// ✅ Webhook routes - use raw body parser
app.use("/webhooks/clerk", express.raw({ type: "application/json" }), webHookRouter);

// ✅ Regular API routes - use JSON parser
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);
app.use("/api/contracts", contractRouter);

// ✅ Socket.IO Authentication & Event Handlers
io.on('connection', async (socket) => {
  console.log('🔌 User connected:', socket.id);

  const { token, userId: clerkId } = socket.handshake.auth;

  // Authenticate user
  if (!clerkId) {
    console.log('❌ Unauthorized socket connection');
    socket.disconnect();
    return;
  }

  try {
    // Get user's MongoDB ID from Clerk ID
    const user = await User.findOne({ clerk_id: clerkId });
    if (!user) {
      console.log('❌ User not found for socket connection');
      socket.disconnect();
      return;
    }

    const userId = user._id.toString();
    socket.userId = userId; // Store userId on socket
    console.log('✅ Authenticated socket for user:', user.name);

    // Join conversation room
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`👤 User ${user.name} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`👋 User ${user.name} left conversation ${conversationId}`);
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user-typing', { userName, userId });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user-stop-typing', { userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
    });

  } catch (error) {
    console.error('❌ Error authenticating socket:', error);
    socket.disconnect();
  }
});

// ✅ Connect to MongoDB and start the server
const startServer = async () => {
  try {
    console.log("Loaded URI:", process.env.MONGO_URI);

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGODB_URI is missing!");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
    httpServer.listen(3001, () => {
      console.log("🚀 Server is running on http://localhost:3001");
      console.log("🔌 Socket.IO is ready for connections");
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};

startServer();
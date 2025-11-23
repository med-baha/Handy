import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import userRouter from "./routes/user.route.js";
import webHookRouter from "./routes/webhook.rout.js";
import postRouter from "./routes/post.route.js";
import conversationRouter from "./routes/conversation.route.js";
import messageRouter from "./routes/message.route.js";

dotenv.config({ path: '.env.local' });

const app = express();

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


// ✅ Connect to MongoDB and start the server
const startServer = async () => {
  try {
    console.log("Loaded URI:", process.env.MONGO_URI);

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGODB_URI is missing!");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
    app.listen(3001, () => console.log("server is running..."))
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};

startServer();
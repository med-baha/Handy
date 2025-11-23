import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
    conversation: {
        type: mongoose.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for efficient message retrieval by conversation
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = model("Message", messageSchema);
export default Message;
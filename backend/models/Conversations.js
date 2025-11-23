import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema({
    participants: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }]
}, { timestamps: true });

// Index to efficiently find conversations by participants
conversationSchema.index({ participants: 1 });

const Conversation = model('Conversation', conversationSchema);
export default Conversation;
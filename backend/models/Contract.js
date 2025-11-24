import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const contractSchema = new Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    estimatedHours: {
        type: Number,
        required: true
    },
    paymentTerms: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Index for efficient queries
contractSchema.index({ sender: 1, receiver: 1 });
contractSchema.index({ status: 1 });

const Contract = model('Contract', contractSchema);
export default Contract;

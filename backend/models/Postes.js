import mongoose, { model, Schema } from "mongoose";
import { ref } from "process";
import user from "./User.js";

const postSchema = new mongoose.Schema({
    poster: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    content: String,

}, { timestamps: true });

const Post = model('Post', postSchema)
export default Post
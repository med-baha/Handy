
import mongoose, { model } from 'mongoose';
import { describe } from 'node:test';
import { type } from 'os';
const { Schema } = mongoose;

const userShcema = new Schema({
    profilepic:String,
    clerk_id:String,
    name: String,
    specialty: String,
    description:String,
    rating:Number,
    is_handy:Boolean,
    is_company:Boolean,
});

const user=model('User',userShcema)
export default user
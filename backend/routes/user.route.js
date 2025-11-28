import express from 'express'
import { getUser, getAllUser, updateUser, updateUserProfile, searchHandys } from '../controllers/user.controller.js';
import { requireAuth } from '@clerk/express'
const userRouter = express.Router();

userRouter.get("/search", requireAuth(), searchHandys)
userRouter.get("/:id", getUser)
userRouter.get("/", requireAuth(), getAllUser)
userRouter.patch("/", requireAuth(), updateUser)
userRouter.patch("/:id", updateUserProfile)

export default userRouter
import express from "express";
import { addNewPost,getPosts } from "../controllers/post.controller.js";

const postRouter=express.Router()
postRouter.post("/",addNewPost)
postRouter.get("/",getPosts)


export default postRouter
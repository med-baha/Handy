import express from "express";
import { addNewUser } from "../controllers/webhook.controller.js";
const webHookRouter=express.Router();

webHookRouter.post("/",addNewUser)

export default webHookRouter

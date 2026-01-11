import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { createConversation, getChatList } from "../controllers/chat.controller";

const router = express.Router();

router.post("/create", auth, createConversation);
router.get("/list", auth, getChatList);

export default router;

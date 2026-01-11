import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.post("/send", auth, upload.single("file"), sendMessage);
router.get("/:conversationId", auth, getMessages);

export default router;

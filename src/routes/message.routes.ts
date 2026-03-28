import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { upload } from "../middlewares/multer";

const router = express.Router();

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send Message
 *     description: Send a text or file message to a conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               text:
 *                 type: string
 *                 description: Message text (optional for file messages)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File attachment (image, video, or document)
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.post("/send", auth, upload.single("file"), sendMessage);

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get Messages
 *     description: Get all messages from a conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Messages retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.get("/:conversationId", auth, getMessages);

export default router;


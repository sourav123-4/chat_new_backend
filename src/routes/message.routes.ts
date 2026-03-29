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
 * /api/messages/list:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Get Messages
 *     description: Get paginated messages from a conversation. Latest messages load first, oldest within each page shown first.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *             properties:
 *               conversationId:
 *                 type: string
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number (1 = most recent messages)
 *               limit:
 *                 type: integer
 *                 default: 20
 *                 description: Number of messages per page
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
router.post("/list", auth, getMessages);

export default router;


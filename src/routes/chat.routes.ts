import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { createConversation, getChatList } from "../controllers/chat.controller";

const router = express.Router();

/**
 * @swagger
 * /api/chats/create:
 *   post:
 *     tags:
 *       - Chats
 *     summary: Create Conversation
 *     description: Create a new conversation (1-to-1 or group)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs (2+ for groups, 2 for 1-to-1)
 *               isGroup:
 *                 type: boolean
 *                 default: false
 *               groupName:
 *                 type: string
 *                 description: Required if isGroup is true
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *                 isNew:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.post("/create", auth, createConversation);

/**
 * @swagger
 * /api/chats/list:
 *   get:
 *     tags:
 *       - Chats
 *     summary: Get Chat List
 *     description: Get all conversations for authenticated user with user status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Conversation'
 *                       - type: object
 *                         properties:
 *                           userStatus:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 userId:
 *                                   type: string
 *                                 isOnline:
 *                                   type: boolean
 *                                 lastSeen:
 *                                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/list", auth, getChatList);

export default router;


import express from "express";
import { auth } from "../middlewares/auth.middleware";
import User from "../models/User";
import pusher from "../config/pusher";

const router = express.Router();

/**
 * @swagger
 * /api/pusher/online:
 *   post:
 *     tags:
 *       - Pusher
 *     summary: Mark User Online
 *     description: Call this when the user opens the app or connects. Marks user as online in DB and broadcasts `user_online` event on `presence-global` channel.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User marked online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 */
router.post("/online", auth, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: true });
    await pusher.trigger("presence-global", "user_online", { userId: req.userId });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

/**
 * @swagger
 * /api/pusher/offline:
 *   post:
 *     tags:
 *       - Pusher
 *     summary: Mark User Offline
 *     description: Call this when the user closes the app or logs out. Marks user as offline, updates `lastSeen` in DB and broadcasts `user_offline` event on `presence-global` channel.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User marked offline
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 */
router.post("/offline", auth, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: false, lastSeen: new Date() });
    await pusher.trigger("presence-global", "user_offline", { userId: req.userId, lastSeen: new Date() });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

/**
 * @swagger
 * /api/pusher/typing:
 *   post:
 *     tags:
 *       - Pusher
 *     summary: Typing Indicator
 *     description: Call this when the user starts or stops typing. Broadcasts `typing` or `stop_typing` event on the conversation channel.
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
 *               - isTyping
 *             properties:
 *               conversationId:
 *                 type: string
 *                 example: "64abc123"
 *               isTyping:
 *                 type: boolean
 *                 description: true = started typing, false = stopped typing
 *                 example: true
 *     responses:
 *       200:
 *         description: Typing event broadcasted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.post("/typing", auth, async (req: any, res) => {
  try {
    const { conversationId, isTyping } = req.body;
    const event = isTyping ? "typing" : "stop_typing";
    await pusher.trigger(`conversation-${conversationId}`, event, {
      userId: req.userId,
      conversationId,
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

/**
 * @swagger
 * /api/pusher/auth:
 *   post:
 *     tags:
 *       - Pusher
 *     summary: Pusher Channel Auth
 *     description: Authenticates the client for private or presence Pusher channels. Called automatically by the Pusher JS SDK — you don't need to call this manually.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - socket_id
 *               - channel_name
 *             properties:
 *               socket_id:
 *                 type: string
 *                 description: Socket ID provided by Pusher JS SDK
 *                 example: "1234.5678"
 *               channel_name:
 *                 type: string
 *                 description: Channel name to authenticate (e.g. private-xyz or presence-global)
 *                 example: "presence-global"
 *     responses:
 *       200:
 *         description: Channel auth token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post("/auth", auth, (req: any, res) => {
  const { socket_id, channel_name } = req.body;
  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: req.userId,
  });
  res.send(authResponse);
});

export default router;

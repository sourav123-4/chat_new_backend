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
 * /api/pusher/auth:
 *   post:
 *     tags:
 *       - Pusher
 *     summary: Pusher Channel Auth
 *     description: |
 *       Authenticates the client for private or presence Pusher channels.
 *       Called automatically by the Pusher JS SDK — configure it as the `authEndpoint`.
 *
 *       **Channel naming:**
 *       - `private-conversation-{conversationId}` — per-conversation events
 *       - `presence-global` — global online/offline presence
 *
 *       **Client events (instant, no server roundtrip):**
 *       - `client-typing` — user started typing
 *       - `client-stop_typing` — user stopped typing
 *
 *       These are triggered directly from frontend via `channel.trigger()` — zero latency.
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
 *                 example: "1234.5678"
 *               channel_name:
 *                 type: string
 *                 example: "private-conversation-64abc123"
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
router.post("/auth", auth, async (req: any, res) => {
  try {
    const { socket_id, channel_name } = req.body;
    const user = await User.findById(req.userId).select("name avatar");

    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: req.userId,
      user_info: { name: user?.name, avatar: user?.avatar },
    });
    res.send(authResponse);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;

import express, { Request, Response } from "express";
import { auth } from "../middlewares/auth.middleware";
import User from "../models/User";
import { sendPushNotification } from "../controllers/notification.controller";

const router = express.Router();

/**
 * @swagger
 * /api/notification/send:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send Push Notification
 *     description: Manually send a push notification to a user by userId. The user must have a deviceToken saved (set on login).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to notify
 *               title:
 *                 type: string
 *                 example: "New Message"
 *               body:
 *                 type: string
 *                 example: "You have a new message from John"
 *               data:
 *                 type: object
 *                 description: Extra key-value data sent with the notification
 *     responses:
 *       200:
 *         description: Notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: User has no device token
 *       404:
 *         description: User not found
 */
router.post("/send", auth, async (req: Request, res: Response) => {
  try {
    const { userId, title, body, data } = req.body;

    const user: any = await User.findById(userId).select("deviceToken");
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.deviceToken) return res.status(400).json({ error: "User has no device token" });

    await sendPushNotification({ deviceToken: user.deviceToken, title, body, data });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;

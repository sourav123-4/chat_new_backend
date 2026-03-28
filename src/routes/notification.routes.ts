import express from "express";
import { sendPushNotification } from "../controllers/notification.controller";

const router = express.Router();

/**
 * @swagger
 * /api/notification/send:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send Push Notification
 *     description: Send a push notification to a user
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
 *                 description: ID of the user to send notification to
 *               title:
 *                 type: string
 *                 example: "New Message"
 *               body:
 *                 type: string
 *                 example: "You have a new message from John"
 *               data:
 *                 type: object
 *                 description: Additional notification data
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 */
router.post("/send", sendPushNotification);

export default router;

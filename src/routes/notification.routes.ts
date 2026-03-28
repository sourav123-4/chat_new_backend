import express from "express";
import { sendPushNotification } from "../controllers/notification.controller";

const router = express.Router();

router.post("/send", sendPushNotification);

export default router;
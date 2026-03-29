import express from "express";
import { auth } from "../middlewares/auth.middleware";
import User from "../models/User";
import pusher from "../config/pusher";

const router = express.Router();

// Called by frontend when user connects
router.post("/online", auth, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: true });
    await pusher.trigger("presence-global", "user_online", { userId: req.userId });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// Called by frontend when user disconnects / app closes
router.post("/offline", auth, async (req: any, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: false, lastSeen: new Date() });
    await pusher.trigger("presence-global", "user_offline", { userId: req.userId, lastSeen: new Date() });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

// Pusher channel auth for private/presence channels
router.post("/auth", auth, (req: any, res) => {
  const { socket_id, channel_name } = req.body;
  const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
    user_id: req.userId,
  });
  res.send(authResponse);
});

export default router;

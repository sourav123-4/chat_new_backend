import { Response } from "express";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import User from "../models/User";
import admin from "../config/firebase";
import pusher from "../config/pusher";
import { AuthRequest } from "../middlewares/auth.middleware";

export const generateToken = (req: AuthRequest, res: Response) => {
  const { channelName, uid } = req.body;
  if (!channelName || uid === undefined)
    return res.status(400).json({ message: "channelName and uid are required" });

  const expireTime = Math.floor(Date.now() / 1000) + 3600;
  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID!,
    process.env.AGORA_APP_CERTIFICATE!,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    expireTime,
    expireTime
  );

  res.json({ token });
};

export const initiateCall = async (req: AuthRequest, res: Response) => {
  const { receiverId, channelName, token, uid, callType } = req.body;

  const [caller, receiver] = await Promise.all([
    User.findById(req.userId),
    User.findById(receiverId),
  ]);

  if (!caller || !receiver)
    return res.status(404).json({ message: "User not found" });

  if (!receiver.deviceToken)
    return res.status(400).json({ message: "Receiver has no device token" });

  await admin.messaging().send({
    token: receiver.deviceToken,
    data: {
      type: "incoming_call",
      callType,
      channelName,
      token,
      uid: String(uid),
      callerName: caller.name,
      callerAvatar: caller.avatar || "",
      callerId: String(caller._id),
    },
    android: { priority: "high" },
    apns: { payload: { aps: { contentAvailable: true } } },
  });

  res.json({ success: true });
};

export const signalCall = async (req: AuthRequest, res: Response) => {
  const { conversationId, event, channelName } = req.body;
  if (!conversationId || !event || !channelName)
    return res.status(400).json({ message: "conversationId, event, and channelName are required" });

  await pusher.trigger(
    `private-conversation-${conversationId}`,
    `call_${event}`,
    { channelName }
  );

  res.json({ ok: true });
};

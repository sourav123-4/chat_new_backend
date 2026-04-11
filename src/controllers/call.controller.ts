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
  const {
    receiverId,
    channelName,
    token,
    uid,
    callType,
    conversationId,
    isGroup,
    groupName,
  } = req.body;

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
      callerId: String(caller._id),
      callerName: caller.name,
      callerAvatar: caller.avatar || "",
      channelName,
      token,               // receiver's own Agora token
      uid: String(uid),    // receiver's own uid
      callType,
      conversationId: String(conversationId),
      isGroup: String(isGroup ?? false),
      groupName: groupName ?? "",
    },
    android: { priority: "high" },
    apns: { payload: { aps: { contentAvailable: true } } },
  });

  res.json({ success: true });
};

export const signalCall = async (req: AuthRequest, res: Response) => {
  const { conversationId, event, channelName } = req.body;
  if (!conversationId || !event)
    return res.status(400).json({ message: "conversationId and event are required" });

  await pusher.trigger(
    `private-conversation-${conversationId}`,
    `call_${event}`,
    { channelName: channelName ?? "" }
  );

  res.json({ ok: true });
};

export const webrtcSignal = async (req: AuthRequest, res: Response) => {
  const { conversationId, type, sdp, candidate } = req.body;
  if (!conversationId || !type)
    return res.status(400).json({ message: "conversationId and type are required" });

  await pusher.trigger(
    `private-conversation-${conversationId}`,
    "webrtc_signal",
    { type, sdp: sdp ?? null, candidate: candidate ?? null, from: req.userId }
  );

  res.json({ ok: true });
};

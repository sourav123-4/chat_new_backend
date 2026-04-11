import Message from "../models/Message";
import Conversation from "../models/Conversation";
import User from "../models/User";
import cloudinary from '../config/cloudinary';
import pusher from '../config/pusher';
import streamifier from 'streamifier';
import { sendPushNotification } from './notification.controller';
import { AuthRequest } from '../middlewares/auth.middleware';

const uploadBufferToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chatapp/messages", resource_type: "auto" },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const sendMessage = async (req: AuthRequest, res: any) => {
  try {
    console.log("req.body==>", req.body, req.file);
    const { conversationId, text } = req.body;
    let fileData = null;
    let messageType = req.body.messageType || "text";
    let message;

    // Call message — create, populate, trigger Pusher, return early
    if (messageType === "call") {
      const callMsg = await Message.create({
        conversationId,
        senderId: req.userId,
        messageType: "call",
        callType: req.body.callType,
        callStatus: req.body.callStatus,
        duration: req.body.duration ?? 0,
      });
      const populated = await callMsg.populate("senderId", "name avatar");
      await pusher.trigger(`private-conversation-${conversationId}`, "message_received", populated.toObject());
      return res.json({ success: true, message: populated });
    }

    // If file exists → upload to Cloudinary
    if (req.file) {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer);

      fileData = {
        url: uploadRes.secure_url,
        type: uploadRes.resource_type === "image" ? "image" :
              uploadRes.resource_type === "video" ? "video" : "file",
        name: req.file.originalname,
        size: req.file.size,
      };

      messageType = fileData.type;
    }

    // Create message
    message = await Message.create({
      conversationId,
      senderId: req.userId,
      text: text || "",
      file: fileData,
      messageType,
      replyTo: req.body.replyTo || null,
      status: "sent",
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: req.userId,
      lastMessageStatus: "sent",
    });

    await pusher.trigger(`private-conversation-${conversationId}`, "message_received", message.toObject());

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(
        (p: any) => p.toString() !== req.userId
      );

      if (otherParticipants.length > 0) {
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        await Conversation.findByIdAndUpdate(conversationId, { lastMessageStatus: "delivered" });
        await pusher.trigger(`private-conversation-${conversationId}`, "message_delivered", {
          messageId: message._id,
          conversationId,
        });

        const sender = await User.findById(req.userId).select("name");
        const recipients = await User.find({
          _id: { $in: otherParticipants },
          deviceToken: { $nin: [null, ""] },
        }).select("deviceToken");

        console.log(`[Push] Recipients with token: ${recipients.length}`);

        await Promise.all(
          recipients.map((r: any) =>
            sendPushNotification({
              deviceToken: r.deviceToken,
              title: sender?.name || "New Message",
              body: message.messageType === "text" ? (message.text || "Sent a message") : `Sent a ${message.messageType}`,
              data: { conversationId: conversationId.toString(), messageId: message._id.toString() },
            })
          )
        );
      }
    }

    res.json({ success: true, message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Message send failed" });
  }
};



export const getMessages = async (req: any, res: any) => {
  try {
    const { conversationId, page: rawPage, limit: rawLimit } = req.body;
    const page = parseInt(rawPage) || 1;
    const limit = parseInt(rawLimit) || 20;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ conversationId });

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .then(msgs => msgs.reverse()); // oldest → newest within the page

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + messages.length < total,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

export const getCallHistory = async (req: AuthRequest, res: any) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    }).populate("participants", "name avatar");

    const convIds = conversations.map((c: any) => c._id);

    const calls = await Message.find({
      messageType: "call",
      conversationId: { $in: convIds },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("senderId", "name avatar");

    const callsWithOther = calls.map((call) => {
      const conv = conversations.find(
        (c: any) => c._id.toString() === call.conversationId.toString()
      ) as any;
      const otherUser = conv?.participants?.find(
        (p: any) => p._id.toString() !== req.userId
      );
      return { ...call.toObject(), otherUser };
    });

    res.json({ calls: callsWithOther });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

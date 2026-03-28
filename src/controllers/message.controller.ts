import Message from "../models/Message";
import Conversation from "../models/Conversation";
import cloudinary from '../config/cloudinary';
import { onlineUsers } from "../sockets/state";
import { getGlobalIO } from "../sockets/global";

export const sendMessage = async (req: any, res: any) => {
  try {
    const io = getGlobalIO();
    console.log("req.body==>", req.body, req.file);
    const { conversationId, text } = req.body;
    let fileData = null;
    let messageType = "text";

    // If file exists → upload to Cloudinary
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/messages",
        resource_type: "auto",
      });

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
    const message = await Message.create({
      conversationId,
      senderId: req.userId,
      text: text || "",
      file: fileData,
      messageType,
      status: "sent",
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: req.userId,
      lastMessageStatus: "sent",
    });

    // Emit to all participants in the conversation
    io.to(conversationId).emit("message_received", message);

    // Check if any other participants are online and mark as delivered
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(
        (p: any) => p.toString() !== req.userId
      );

      const isAnyReceiverOnline = otherParticipants.some((p: any) =>
        onlineUsers.has(p.toString()) && onlineUsers.get(p.toString())!.size > 0
      );

      if (isAnyReceiverOnline) {
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageStatus: "delivered"
        });

        io.to(conversationId).emit("message_delivered", {
          messageId: message._id,
          conversationId,
        });
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
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name email avatar")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

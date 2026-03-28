import Message from "../models/Message";
import Conversation from "../models/Conversation";

import cloudinary from '../config/cloudinary';
import { io } from "../server";

export const sendMessage = async (req: any, res: any) => {
  try {

    console.log("req.bosy==>", req.body, req.file)
    const { conversationId, text } = req.body;
    let fileData = null;
    let messageType = "text";

    // If file exists → upload
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "chatapp/messages",
        resource_type: "auto",
      });


      fileData = {
        url: uploadRes.secure_url,
        type: uploadRes.resource_type, // image / video
        name: req.file.originalname,
        size: req.file.size,
      };

      messageType = uploadRes.resource_type === "image" ? "image" : "file";
    }

    const message = await Message.create({
      conversationId,
      senderId: req.userId,
      text: text || "",
      file: fileData,
      messageType,
      status: "sent",
    });


    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: req.userId,
    });

    // socket emit
    io.to(conversationId).emit("message_received", message);

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

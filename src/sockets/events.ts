import Message from "../models/Message";
import Conversation from "../models/Conversation";
import { io } from "../server";
import { onlineUsers, lastSeen } from "./state";

export const registerSocketEvents = (socket: any) => {
  const userId = socket.userId;

  /* ---------------- ONLINE ---------------- */
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socket.id);

  // Emit online only if this is the first socket
  if (onlineUsers.get(userId)!.size === 1) {
    io.emit("user_online", { userId });

    // Mark pending messages as delivered when user comes online
    (async () => {
      try {
        const conversations = await Conversation.find({ participants: userId });
        for (const conv of conversations) {
          const messages = await Message.find({
            conversationId: conv._id,
            senderId: { $ne: userId },
            status: "sent"
          });
          for (const msg of messages) {
            await Message.findByIdAndUpdate(msg._id, { status: "delivered" });
            io.to(conv._id.toString()).emit("message_delivered", {
              messageId: msg._id,
              conversationId: conv._id,
            });
          }
          if (messages.length > 0) {
            await Conversation.findByIdAndUpdate(conv._id, { lastMessageStatus: "delivered" });
          }
        }
      } catch (err) {
        console.log("❌ Error marking messages delivered on online:", err);
      }
    })();
  }

  console.log("🟢 Online:", userId);

  /* ---------------- JOIN ROOM ---------------- */
socket.on("join_conversation", async (conversationId: string) => {
  socket.join(conversationId);

  // mark all unread messages as read
  const unreadMessages = await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      status: { $ne: "read" },
    },
    {
      status: "read",
      $addToSet: { readBy: userId },
    }
  );

  if (unreadMessages.modifiedCount > 0) {
    io.to(conversationId).emit("messages_read_bulk", {
      conversationId,
      readerId: userId,
    });
  }
});


  /* ---------------- TYPING ---------------- */
  socket.on("typing", ({ conversationId }: { conversationId: string }) => {
    socket.to(conversationId).emit("typing", { userId, conversationId });
  });

  socket.on("stop_typing", ({ conversationId }: { conversationId: string }) => {
    socket.to(conversationId).emit("stop_typing", { userId, conversationId });
  });

  /* ---------------- SEND MESSAGE ---------------- */
socket.on("send_message", async (payload: any) => {
  try {
    console.log("payload in event==>",payload)
    const { conversationId, text, file, messageType } = payload;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      text: text || "",
      file: file || null,
      messageType,
      status: "sent",
    });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: userId,
      lastMessageStatus: "sent",
    });

    /* 1️⃣ MESSAGE RECEIVED */
    io.to(conversationId).emit("message_received", message);

    /* 2️⃣ CHECK IF RECEIVER IS ONLINE */
    const otherParticipants = conversation.participants.filter((p: any) => p.toString() !== userId);
    const isAnyReceiverOnline = otherParticipants.some((p: any) => onlineUsers.has(p.toString()));

    if (isAnyReceiverOnline) {
      // receiver is online → delivered
      await Message.findByIdAndUpdate(message._id, {
        status: "delivered",
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageStatus: "delivered",
      });

      io.to(conversationId).emit("message_delivered", {
        messageId: message._id,
        conversationId,
      });
    }

  } catch (err) {
    console.log("❌ send_message error:", err);
  }
});



  /* ---------------- READ MESSAGE ---------------- */
  socket.on("message_read", async ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        status: "read",
        $addToSet: { readBy: userId },
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageStatus: "read",
      });

      io.to(conversationId).emit("message_read", {
        messageId,
        userId,
      });
    } catch (err) {
      console.log("❌ message_read error:", err);
    }
  });

  /* ---------------- DISCONNECT ---------------- */
  socket.on("disconnect", () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId)!.delete(socket.id);
      if (onlineUsers.get(userId)!.size === 0) {
        onlineUsers.delete(userId);
        lastSeen.set(userId, Date.now());
        io.emit("user_offline", {
          userId,
          lastSeen: Date.now(),
        });
      }
    }

    console.log("🔴 Offline:", userId);
  });
};

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    lastMessageAt: Date,
    lastMessageSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent"
    }

  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);

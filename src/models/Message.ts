import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    file: {
      url: { type: String },
      type: { type: String },     // image | video | file
      name: { type: String },
      size: { type: Number },
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "call"],
      default: "text",
    },
    callType: {
      type: String,
      enum: ["audio", "video"],
    },
    callStatus: {
      type: String,
      enum: ["answered", "missed", "declined"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sent"
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]

  },
  { timestamps: true }
);


export default mongoose.model("Message", messageSchema);

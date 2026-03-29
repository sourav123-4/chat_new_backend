import Conversation from "../models/Conversation";
import { getUserStatus } from "../utils/userStatus";

export const createConversation = async (req: any, res: any) => {
  try {
    console.log("request and body==>",req.body)
    const { participants, isGroup, groupName } = req.body;
    
    // If not a group chat, check if conversation already exists between these participants
    if (!isGroup && participants && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants },
        isGroup: false
      }).populate("participants", "name email avatar");
      
      if (existingConversation) {
        return res.json({ success: true, conversation: existingConversation, isNew: false });
      }
    }
    
    const conversation = await Conversation.create({
      participants,
      isGroup,
      groupName: isGroup ? groupName : undefined
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name email avatar");

    res.json({ success: true, conversation: populatedConversation, isNew: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

export const getChatList = async (req: any, res: any) => {
  try {
    const userId = req.userId;

    const chats = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name email avatar")
      .populate("lastMessage", "file text sender createdAt status")
      .exec();

    const chatsWithStatus = await Promise.all(
      chats.map(async (chat: any) => {
        const otherUsers = chat.participants.filter(
          (p: any) => p._id.toString() !== userId
        );

        const statuses = await Promise.all(
          otherUsers.map(async (u: any) => ({
            userId: u._id,
            ...(await getUserStatus(u._id.toString())),
          }))
        );

        return { ...chat.toObject(), userStatus: statuses };
      })
    );

    res.json({
      success: true,
      chats: chatsWithStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};



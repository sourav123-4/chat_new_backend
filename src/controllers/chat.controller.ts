import Conversation from "../models/Conversation";

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

export const getChatList = async (req:any, res:any) => {
  try {
    const userId = req.userId;

    const chats = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name email avatar")
      .populate("lastMessage", "file text sender createdAt")
      .exec();

    res.json({
      success: true,
      chats,
      message: "Chat List Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};


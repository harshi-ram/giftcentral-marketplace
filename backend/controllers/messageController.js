import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      members: req.user._id
    })
      .populate('members', 'name profilePic')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name profilePic' }
      })
      .sort({ updatedAt: -1 })
      .lean();

    const result = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCounts?.[userId] || 0, 
      unreadCounts: conv.unreadCounts || {} 
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markConversationRead = async (req, res) => {
  console.log("mark convo");
  try {
    const { id } = req.params; 
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();

    await Message.updateMany(
      { conversationId: id, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    res.json({ message: 'Conversation marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const createMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      text,
      readBy: [req.user._id]
    });

    const conversation = await Conversation.findById(conversationId);

    conversation.members.forEach(memberId => {
      if (memberId.toString() !== req.user._id.toString()) {
        const current = conversation.unreadCounts.get(memberId.toString()) || 0;
        conversation.unreadCounts.set(memberId.toString(), current + 1);
      }
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profilePic')
      .lean();

    res.json({
      messages: messages.reverse(), 
      hasMore: messages.length === limit
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: err.message
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ members: userId })
      .populate('members', 'name profilePic')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profilePic'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: err.message });
  }
};

export const startConversation = async (req, res) => {
  console.log("start");
  try {
    const { userId } = req.body;
    const selfId = req.user._id;

    let conversation = await Conversation.findOne({
      members: { $all: [selfId, userId], $size: 2 }
    });

    if (!conversation) {
      conversation = new Conversation({ members: [selfId, userId] });
      await conversation.save();
    }

    conversation = await conversation.populate('members', 'name profilePic');
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to start conversation', error: err.message });
  }
};
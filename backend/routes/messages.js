import express from 'express';
import Message from '../model/Message.js';
import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

// Get conversation between two users
router.get('/conversation/:otherUserId', isAuthenticated, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userID;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .populate('senderId', 'Username email')
      .populate('receiverId', 'Username email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// Get all conversations for a user
router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.userID;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'Username email')
      .populate('receiverId', 'Username email')
      .sort({ createdAt: -1 });

    // Group by conversation
    const conversations = {};
    messages.forEach(msg => {
      const otherUser = msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
      const key = otherUser._id;
      if (!conversations[key]) {
        conversations[key] = {
          userId: otherUser._id,
          Username: otherUser.Username,
          email: otherUser.email,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt
        };
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversations)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// Save a message (HTTP fallback, Socket.IO is primary)
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { receiverId, message, listingId } = req.body;
    const senderId = req.userID;

    const conversationId = [senderId, receiverId].sort().join('_');

    const newMessage = new Message({
      conversationId,
      senderId,
      receiverId,
      listingId,
      message
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'Username email');
    await newMessage.populate('receiverId', 'Username email');

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

export default router;

import express from 'express';
import ChatModel from '../models/Chat.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

// Route to get chat history between two users
router.get('/chat/:receiver', verifyUser, async (req, res) => {
  const { receiver } = req.params;
  const user = req.name; // Use the logged-in user's name

  try {
    const messages = await ChatModel.find({
      $or: [
        { sender: user, receiver },
        { sender: receiver, receiver: user }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Route to save a new message
router.post('/chat', verifyUser, async (req, res) => {
  const { receiver, text } = req.body;
  const sender = req.name; // Use the logged-in user's name

  try {
    if (!sender || !receiver || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new message entry in the database
    const message = await ChatModel.create({ sender, receiver, text });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

export default router;

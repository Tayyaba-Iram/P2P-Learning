import express from 'express';
import ChatModel from '../models/Chat.js';

const router = express.Router();


// Route to get chat history for a specific student
router.get('/api/chats/:studentId', async (req, res) => {
  try {
    const chat = await ChatModel.findOne({ studentId: req.params.studentId }).populate('studentId');
    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error });
  }
});

// Route to save a message
router.post('/api/chats/:studentId', async (req, res) => {
  const { sender, text } = req.body;
  const studentId = req.params.studentId;

  try {
    let chat = await ChatModel.findOne({ studentId });
    if (!chat) {
      chat = new chat({ studentId, messages: [] });
    }
    chat.messages.push({ sender, text });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error saving message', error });
  }
});

export default router;

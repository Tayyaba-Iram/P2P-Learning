import express from 'express';
import Session from '../models/Session.js'; // Adjust if model name is 'Session'

const router = express.Router();

// Route to add a new session
router.post('/addsessions', async (req, res) => { // Adjusted path for RESTful convention
  try {
    const newSession = new Session({
      topic: req.body.topic,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      date: req.body.date,
      meetingLink: req.body.meetingLink,
    });

    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(400).json({ message: error.message });
  }
});

// Route to get all sessions
router.get('/sessions', async (req, res) => { // Adjusted path for RESTful convention
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: error.message });
  }
});

export default router;

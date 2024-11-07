import express from 'express';
import Session from '../models/Session.js'; // Assuming your model is named 'Session'

const router = express.Router();

// Route to add a new session
router.post('/sessions', async (req, res) => {
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
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a session by ID
router.delete('/sessions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting session" });
  }
});

// Endpoint to verify the meeting link
router.get('/sessions/verify/:meetingLink', async (req, res) => {
  const { meetingLink } = req.params;

  try {
    const session = await Session.findOne({ meetingLink });
    if (session) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



export default router;

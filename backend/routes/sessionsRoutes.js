import express from 'express';
import Session from '../models/Session.js';
import cors from 'cors';

const app = express();
const router = express.Router();


app.use(cors());
app.use(express.json());


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

// Route to delete a session
router.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Find and delete session using the MongoDB _id (sessionId)
    const session = await Session.findByIdAndDelete(sessionId);

    if (session) {
      return res.json({ success: true, message: 'Session deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Verify session API route
router.get("/sessions/verify/:meetingID", async (req, res) => {
  const { meetingID } = req.params;

  try {
    // Find the session by meeting ID in the database
    const session = await Session.findOne({ meetingLink: `https://meet.jit.si/${meetingID}` });

    if (session) {
      return res.json({ success: true, message: "Session found" });
    } else {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
  } catch (error) {
    console.error("Error verifying session:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
import express from 'express';
import Session from '../models/Session.js'; // Assuming your model is named 'Session'
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

// Route to verify if a session link is in the database
router.get('/sessions/verify/:meetingID', async (req, res) => {
  const { meetingID } = req.params;
  try {
    // Look for a session with the matching meeting ID
    const session = await Session.findOne({ meetingLink: `https://meet.jit.si/${meetingID}` });
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

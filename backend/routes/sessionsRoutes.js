import express from 'express';
import SessionModel from '../models/Session.js';
import verifyUser from '../middleware/verifyUser.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Helper to handle __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });
// Route to add a new session
router.post('/sessions', verifyUser, upload.single('file'), async (req, res) => {
  try {
    const {
      topic,
      startTime,
      endTime,
      date,
      meetingLink,
      paymentMethod,
      amount,
      senderName,
      senderTitle,
      senderNumber,
      instructorName,
      instructorHolder,
      instructorNumber,
      foodBrand,
      foodItem,
    } = req.body;

    // ✅ Get logged-in user's email from req.user
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized. Email not found in token.' });
    }

    let sessionData = {
      topic,
      startTime,
      endTime,
      date,
      meetingLink,
      paymentMethod,
      status: 'Pending', // default status
      userEmail // ✅ Add user's email to session data
    };

    if (paymentMethod === 'cash') {
      sessionData.amount = amount;
      sessionData.senderName = senderName;
      sessionData.senderTitle = senderTitle;
      sessionData.senderNumber = senderNumber;
      sessionData.instructorName = instructorName;
      sessionData.instructorHolder = instructorHolder;
      sessionData.instructorNumber = instructorNumber;
    } else if (paymentMethod === 'food') {
      sessionData.foodBrand = foodBrand;
      sessionData.foodItem = foodItem;
      if (req.file) {
        sessionData.foodBill = req.file.filename; // Store file name
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment method. Use either "cash" or "food".' });
    }

    const newSession = new SessionModel(sessionData);
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(400).json({ message: error.message });
  }
});


router.get('/get-sessions', verifyUser, async (req, res) => {
    try {
        const account = await SessionModel.find(); // Assuming you want to fetch one account for simplicity
        res.status(200).json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to delete a session
router.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Find and delete session using the MongoDB _id (sessionId)
    const session = await SessionModel.findByIdAndDelete(sessionId);

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
    const session = await SessionModel.findOne({ meetingLink: `https://meet.jit.si/${meetingID}` });

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

router.get('/sessions', verifyUser, async (req, res) => {
  try {
    const userEmail = req.user.email; // Get the email from the verified token
    console.log("Logged-in user's email:", userEmail);

    const sessions = await SessionModel.find({ userEmail }); // Filter by email

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
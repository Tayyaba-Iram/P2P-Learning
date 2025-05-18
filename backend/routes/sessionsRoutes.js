import express from 'express';
import SessionModel from '../models/Session.js';
import verifyUser from '../middleware/verifyUser.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
      receiver,
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
      sessionData.receiver= receiver;
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

router.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await SessionModel.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // If session has a food bill file, attempt to delete it
    if (session.foodBill) {
      const filePath = path.join(__dirname, '../uploads', session.foodBill);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn(`Failed to delete file: ${filePath}`, err);
          // Not returning here because we still want to delete the DB entry
        } else {
          console.log(`Deleted file: ${filePath}`);
        }
      });
    }

    // Delete the session from MongoDB
    await SessionModel.findByIdAndDelete(sessionId);

    res.json({ success: true, message: 'Session and associated file deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error' });
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
    const userEmail = req.user.email;
    console.log("Logged-in user's email:", userEmail);

    const allSessions = await SessionModel.find({ userEmail });

    // Filter sessions where endTime is in the future
    const upcomingSessions = allSessions.filter(session => {
      const endDateTime = new Date(`${session.date}T${session.endTime}`);
      return endDateTime > new Date();
    });

    res.json(upcomingSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

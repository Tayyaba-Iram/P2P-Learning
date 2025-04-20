import express from 'express';
import BroadcastRequest from '../models/BroadcastRequest.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';  // Use the correct model
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

const router = express.Router();

// POST route to handle broadcast request submission
router.post('/broadcastRequest', verifyUser, async (req, res) => {
  try {
    const { topic, subtopic, urgency, programs, userId } = req.body;

    // 1. Save new broadcast request
    const newRequest = new BroadcastRequest({
      topic,
      subtopic,
      urgency,
      programs,
      userId, // You can store this if needed
    });

    await newRequest.save();

    // 2. Find all verified students whose program matches
    const matchedStudents = await VerifiedStudentModel.find({
      program: { $in: programs },  // Match programs
      isVerified: true             // Only verified students
    });

    // 3. Notify (currently console log — replace with real notification)
    matchedStudents.forEach(student => {
      console.log(` Request sent to: ${student.name} (${student.program})`);
      // Example placeholder:
      // sendSocketNotification(student._id, newRequest); // Uncomment if using real-time notifications
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(' Error in broadcast request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET route to fetch all broadcast requests for a specific user
router.get('/broadcastRequest/:userId', verifyUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await BroadcastRequest.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

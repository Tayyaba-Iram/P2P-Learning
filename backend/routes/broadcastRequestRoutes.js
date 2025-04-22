import express from 'express';
import BroadcastRequest from '../models/BroadcastRequest.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';  // Use the correct model
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

const router = express.Router();
router.post('/broadcastRequest', verifyUser, async (req, res) => {
  try {
    const { topic, subtopic, urgency, programs } = req.body;

    const userId = req.user.id || req.user._id; // get from token middleware

    const newRequest = new BroadcastRequest({
      topic,
      subtopic,
      urgency,
      programs,
      userId,
      name: req.user.name,  // Assuming 'name' is part of the logged-in user's data
      email: req.user.email, // Assuming 'email' is part of the logged-in user's data
    });

    await newRequest.save();

    const matchedStudents = await VerifiedStudentModel.find({
      program: { $in: programs },
      isVerified: true,
    });

    matchedStudents.forEach(student => {
      console.log(`Request sent to: ${student.name} (${student.program})`);
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in broadcast request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET route to fetch all broadcast requests for a specific user
// GET route to fetch all broadcast requests for the logged-in user
router.get('/get-broadcastRequest', verifyUser, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // Get from token

    const requests = await BroadcastRequest.find({ userId });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE route to delete a specific broadcast request
router.delete('/delete-broadcastRequest/:id', verifyUser, async (req, res) => {
  try {
    const deletedRequest = await BroadcastRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting broadcast request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/broadcastRequest-By-Programs', verifyUser, async (req, res) => {
  try {
    const student = await VerifiedStudentModel.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentProgram = student.program; // e.g., "BSSE"

    const matchingRequests = await BroadcastRequest.find({
      programs: { $in: [studentProgram] },
      userId: { $ne: req.user._id } // exclude current user's requests
    });

    res.status(200).json(matchingRequests);
  } catch (error) {
    console.error('Error fetching filtered broadcast requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

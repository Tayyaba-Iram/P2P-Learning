import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

dotenv.config();

const router = express.Router();

// Apply the middleware to protect the route
router.get('/getUserDetails', verifyUser, async (req, res) => {
  try {
    // Now the user data is available in req.user from the verifyUser middleware
    const user = await VerifiedStudentModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json('User not found');
    }

    // Send back the user data
    res.json({ name: user.name, email: user.email, _id: user._id  });

  } catch (err) {
    console.error('Error retrieving user details:', err);  // Add logging to capture any errors
    res.status(500).json('Error retrieving user details');
  }
});

export default router;

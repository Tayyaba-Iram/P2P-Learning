import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js'; 

dotenv.config();

const router = express.Router();

router.get('/getUserDetails', verifyUser, async (req, res) => {
  try {
    const user = await VerifiedStudentModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json('User not found');
    }

    res.json({ name: user.name, email: user.email, _id: user._id  });

  } catch (err) {
    console.error('Error retrieving user details:', err);  
    res.status(500).json('Error retrieving user details');
  }
});

export default router;

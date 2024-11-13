import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
dotenv.config();

const router = express.Router();

// Endpoint to get logged-in user's details
router.get('/getUserDetails', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json('Authentication required');

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json('Invalid token');
    }
    try {
      const user = await VerifiedStudentModel.findOne({ email: decoded.email });
      res.json({ name: user.name });
    } catch (err) {
      res.status(500).json('Error retrieving user details');
    }
  });
});

export default router;

// routes/login.js
import express from 'express';
import VerifiedStudentModel from '../models/VerifiedStudent.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the student by email
    const student = await VerifiedStudentModel.findOne({ email });
    
    // Check if student exists
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if the provided password matches the stored password
    if (student.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Successful login
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

export default router;

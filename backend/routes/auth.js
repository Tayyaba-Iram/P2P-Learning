import express from 'express';
import jwt from 'jsonwebtoken'; // Importing JWT
import dotenv from 'dotenv';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import UniAdminModel from '../models/UniAdmin.js';
dotenv.config();
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, username: user.username }, // Payload
    process.env.JWT_SECRET_KEY, // Secret key for signing
    { expiresIn: '1h' } // Expiration time
  );
};

// Student login route
router.post('/studentlogin', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received data:', { email, password });

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

    // Create JWT token for the student
    const token = generateToken(student);

    // Set the token in a cookie (httpOnly, secure for production)
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 3600000 }); // 1 hour expiry time
    console.log("Cookies in response: ", req.cookies);


    // Successful login
    res.json({ success: true, message: 'Login successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

// Admin login route
router.post('/adminlogin', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received data:', { email, password });

  try {
    // Find the admin by email
    const admin = await UniAdminModel.findOne({ email });
    
    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if the provided password matches the stored password
    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Create JWT token for the admin
    const token = generateToken(admin);

    // Set the token in a cookie (httpOnly, secure for production)
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 3600000 }); // 1 hour expiry time

    // Successful login
    res.json({ success: true, message: 'Login successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});

export default router;

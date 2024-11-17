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
    { email: user.email, name: user.name,  _id: user._id }, // Payload
    process.env.JWT_SECRET_KEY, // Secret key for signing
    { expiresIn: '2h' } // Expiration time
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

    // Log the token to the console (for debugging purposes)
    console.log("Generated token:", token);

    // Return the token in the response (without setting a cookie)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        _id: student._id,  email: student.email, name: student.name },
    });
    console.log("name: ", student.name);
    console.log("email: ", student.email);
    
  } catch (err) {
    console.error('Error during login:', err);
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

    // Log the token to the console (for debugging purposes)
    console.log("Generated token:", token);

    // Return the token in the response (without setting a cookie)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { email: admin.email, name: admin.name },
    });
    console.log("name: ", admin.name);
     console.log("email: ", admin.email);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
  
});

router.post('/logout', (req, res) => {
  // Optionally, invalidate the token on the server side (e.g., remove from a database)
  res.json({ message: 'Successfully logged out' });
});

export default router;
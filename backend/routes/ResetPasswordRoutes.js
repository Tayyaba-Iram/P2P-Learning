import express from 'express';
import SuperAdminModel from '../models/Superadmin.js'; // Adjust path as necessary
import VerifiedStudentModel from '../models/VerifiedStudent.js'; // Adjust path as necessary
import UniAdminModel from '../models/UniAdmin.js'; // Adjust path as necessary
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_GMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

// Function to get the appropriate model based on email domain
const getModelByEmailDomain = (email) => {
  if (email.endsWith('@gmail.com')) {
    return SuperAdminModel;
  } else if (email.endsWith('@students.riphah.edu.pk')) {
    return VerifiedStudentModel;
  } else if (email.endsWith('@admin.edu.pk')) {
    return UniAdminModel;
  }
  return null;
};

// Request password reset
router.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const Model = getModelByEmailDomain(email);
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Invalid email domain' });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('User found');

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log('Reset link:', resetLink);
    await transporter.sendMail({
      from: process.env.MY_GMAIL,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) return res.status(400).json({ success: false, message: 'New password is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { email } = decoded;
    const Model = getModelByEmailDomain(email);
    
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Invalid email domain' });
    }

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ success: false, message: 'Invalid token or password' });
  }
});

export default router;

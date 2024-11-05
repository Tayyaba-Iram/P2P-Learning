import express from 'express';
import bcrypt from 'bcrypt';
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

// Generate a password reset token function
const generateResetToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
};

// Request password reset
router.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UniAdminModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('User found');

    const resetToken = generateResetToken(user.email);

    // Send email with reset link
    const resetLink = `http://localhost:3001/reset-password/${resetToken}`;
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

  // Check if the new password is provided
  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UniAdminModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Directly save the new password without hashing
    user.password = newPassword; // Set the new password directly
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ success: false, message: 'Invalid token or password' });
  }
});

export default router;

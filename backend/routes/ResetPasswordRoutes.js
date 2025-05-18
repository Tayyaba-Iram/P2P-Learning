import express from 'express';
import SuperAdminModel from '../models/Superadmin.js'; 
import VerifiedStudentModel from '../models/VerifiedStudent.js'; 
import UniAdminModel from '../models/UniAdmin.js'; 
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

router.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const Model = getModelByEmailDomain(email);
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Invalid email domain' });
    }


    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log('Sending email to:', email); 
    console.log('Reset link:', resetLink);
    try {
      await transporter.sendMail({
        from: `"P2P Learning" <${process.env.MY_GMAIL}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
        <p>Hello,</p>
        <p>You requested a password reset for your account. Please click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Your Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,</p>
        <p>P2P Learning Team</p>
      `, 
      });
      
      console.log('Email sent');
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      return res.status(500).json({ success: false, message: 'Failed to send reset email' });
    }
    

    res.json({ success: true, message: 'Reset link sent to your email',   link: resetLink});
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Both password and confirm password are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

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
    user.cpassword = confirmPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ success: false, message: 'Invalid token or password' });
  }
});

export default router;

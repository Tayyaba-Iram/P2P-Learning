import express from 'express';
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import UniAdminModel from '../models/UniAdmin.js';

dotenv.config();
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, name: user.name,  _id: user._id }, 
    process.env.JWT_SECRET_KEY, 
    { expiresIn: '2h' } 
  );
};
router.post('/studentlogin', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received data:', { email, password });

  try {
   
    const student = await VerifiedStudentModel.findOne({ email });
    
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (student.blocked) {
      return res.status(403).json({ success: false, message: 'Your account is suspended and blocked. Please contact support.' });
    }

    if (student.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(student);

    console.log("Generated token:", token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        _id: student._id,  
        email: student.email, 
        name: student.name 
      },
    });
    console.log("name: ", student.name);
    console.log("email: ", student.email);
    
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
});


router.post('/adminlogin',async (req, res) => {
  const { email, password } = req.body;

  console.log('Received data:', { email, password });

  try {
 
    const admin = await UniAdminModel.findOne({ email });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(admin);

    console.log("Generated token:", token);

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
  res.json({ message: 'Successfully logged out' });
});

export default router;
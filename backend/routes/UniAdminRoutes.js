// routes/register.js
import express from 'express';
import UniAdminModel from '../models/UniAdmin.js';
import verifiedUniAdminModel from '../models/VerifiedUniAdmin.js';

const router = express.Router();

// Registration endpoint
router.post('/registerUniAdmin', async (req, res) => {
  const { name, sapid, email, cnic, university, campus, password, cpassword } = req.body;

  console.log('Received data:', {
    name, sapid, email, cnic, university,  campus, password, cpassword});

  try {
    // Check if the email already exists in the verifiedUniAdminModel collection
    const existingVerifiedUniAdmin = await verifiedUniAdminModel.findOne({ email });
    if (existingVerifiedUniAdmin) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Check if the student exists in the UniAdminModel collection
    const UniAdmin = await UniAdminModel.findOne({
      name, sapid, email, cnic, university, campus, });

    if (UniAdmin) {
      console.log('UniAdmin found:', UniAdmin);

      // Create a new verified student object, including password fields
      const verifiedUniAdminData = { ...UniAdmin.toObject(), password, cpassword };

      // Save to VerifiedStudentModel collection
      const verifiedUniAdmin = new verifiedUniAdminModel(verifiedUniAdminData);
      await verifiedUniAdmin.save();

      console.log('UniAdmin verified and saved to verified collection:', verifiedUniAdmin);

      res.status(200).json({ message: 'Registration verified successfully!' });
    } else {
      console.log('No matching UniAdmin found');
      res.status(400).json({ error: 'UniAdmin information does not match our records' });
    }
  } catch (error) {
    console.error('Error during query:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// GET endpoint to fetch all verified UniAdmins
router.get('/verifiedUniAdmins', async (req, res) => {
    try {
      const verifiedUniAdmins = await verifiedUniAdminModel.find({});
      res.status(200).json(verifiedUniAdmins);
      console.log('Admins verified and saved to verified collection:', verifiedUniAdmins);

    } catch (error) {
      console.error('Error fetching verified UniAdmins:', error);
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  });

export default router;

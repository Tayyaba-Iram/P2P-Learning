import express from 'express';
import UniAdminModel from '../models/UniAdmin.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();


router.post('/registerUniAdmin',verifyUser, async (req, res) => {
  const { name, sapid, email, cnic, phone, university, campus, password, cpassword } = req.body;

  console.log('Received data:', {
    name, sapid, email, cnic, phone, university, campus, password, cpassword
  });

  try {
    const existingEmail = await UniAdminModel.findOne({ email });
    if (existingEmail) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const existingSapid = await UniAdminModel.findOne({ sapid });
    if (existingSapid) {
      console.log('ID already registered:', sapid);
      return res.status(400).json({ error: 'ID is already registered.' });
    }

    const newUniAdmin = new UniAdminModel({
      name,
      sapid,
      email,
      cnic,
      phone,
      university,
      campus, 
      password, 
      cpassword  
    });

    await newUniAdmin.save();
    console.log('New UniAdmin saved:', newUniAdmin);

    res.status(201).json({ message: 'Admin registered successfully!', data: newUniAdmin });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

router.get('/Uniadmins', async (req, res) => {
  try {
    const Uniadmins = await UniAdminModel.find();
    res.status(200).json(Uniadmins);

  } catch (error) {
    console.error('Error fetching Uniadmins:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

router.delete('/Uniadmins/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    
    const result = await UniAdminModel.findByIdAndDelete(adminId);
    
    if (!result) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Server error while deleting admin' });
  }
});
export default router;

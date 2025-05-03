import express from 'express';
import ComplaintModel from '../models/Complain.js';
import verifyUser from '../middleware/verifyUser.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../Complains'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST route for complaints
router.post('/complaints', verifyUser, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const { targetname, targetemail, date, category, description } = req.body;

  if (!targetname || !targetemail || !date || !category || !description || !req.file) {
    return res.status(400).json({ error: 'All fields including file are required' });
  }

  const newComplaint = new ComplaintModel({
    userId: req.user._id,
    username: req.user.name,
    useremail: req.user.email,
    targetname,
    targetemail,
    date,
    category,
    description,
    file: req.file.filename  // Save the filename
  });
  try {
    await newComplaint.save();
    res.status(201).json({ message: 'Complaint created successfully', filename: req.file.filename });  // Send filename
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creating complaint', details: err.message });
  }
});

// GET route to view all complaints
router.get('/viewComplaints', async (req, res) => {
  try {
    const complaints = await ComplaintModel.find();
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Route to get complaints for the logged-in user
router.get('/get-complaints', verifyUser, async (req, res) => {
  try {
    const userComplaints = await ComplaintModel.find({ userId: req.user._id });

    if (!userComplaints || userComplaints.length === 0) {
      return res.status(200).json({ error: 'No complaints found for this user' });
    }

    res.json(userComplaints);
  } catch (err) {
    console.error('Error fetching complaints:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.delete('/delete-complaint/:id', verifyUser, async (req, res) => {
  try {
    const complaintId = req.params.id;

    // Find the complaint first
    const complaint = await ComplaintModel.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // If a file exists, delete it from the server
    if (complaint.file) {
      const filePath = path.join(__dirname, '../Complains', complaint.file);
      try {
        await fs.unlink(filePath);
        console.log('File deleted successfully');
      } catch (fileError) {
        console.error('Failed to delete file:', fileError);
      }
    }

    // Now delete the complaint document
    await ComplaintModel.findByIdAndDelete(complaintId);

    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });

  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to delete complaint' });
  }
});


router.get('/complaint/:complaintId', async (req, res) => {
  try {
    // Find the complaint by ID (mongoose will automatically cast string to ObjectId)
    const complaint = await ComplaintModel.findById(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: 'Error fetching complaint' });
  }
});


router.put('/resolve-complaint/:id', async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.status = 'Resolved';
    await complaint.save();

    res.json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ error: 'Server error while resolving complaint' });
  }
});


export default router;

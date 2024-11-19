import express from 'express';
import ComplaintModel from '../models/Complain.js';
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

const router=express.Router();


// POST route to submit a complaint
router.post('/complaints', verifyUser, async (req, res) => {
    try {
        const { name, sapid, email, university, date, category, description } = req.body;

        // Check if any required field is missing
        if (!name || !sapid || !email || !university || !date || !category || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create new complaint
        const newComplaint = new ComplaintModel({
            userId: req.user._id,  // Check if userId is being passed correctly
            name,
            sapid,
            email,
            university,
            date,
            category,
            description
        });

        // Save the complaint
        await newComplaint.save();

        // Send success response
        res.status(201).json({ message: 'Complaint created successfully' });
    } catch (err) {
        console.error('Error:', err);  // Log the full error for debugging
        res.status(500).json({ error: 'Error creating complaint', details: err.message });
    }
});


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
    console.log('Received request for complaints');
    console.log('User ID from token:', req.user._id);  // Log the decoded user ID
  
    try {
      const userComplaints = await ComplaintModel.find({ userId: req.user._id });
      console.log('Fetched complaints:', userComplaints);  // Log the fetched complaints
  
      if (!userComplaints || userComplaints.length === 0) {
        return res.status(404).json({ error: 'No complaints found for this user' });
      }
  
      res.json(userComplaints);
    } catch (err) {
      console.error('Error fetching complaints:', err.message);
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  });
  
  




// Delete a specific complaint by its ID
router.delete('/delete-complaint/:id', verifyUser, async (req, res) => {
    try {
      const complaintId = req.params.id;
      const deletedComplaint = await ComplaintModel.findByIdAndDelete(complaintId);
  
      if (!deletedComplaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
  
      res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error('Error deleting complaint:', error);
      res.status(500).json({ success: false, message: 'Failed to delete complaint' });
    }
  });
  
export default router;
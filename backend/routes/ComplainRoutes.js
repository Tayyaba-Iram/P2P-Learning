import express from 'express';
import ComplaintModel from '../models/Complain.js';
import verifyUser from '../middleware/verifyUser.js';  // Import the middleware

const router=express.Router();


// POST route to submit a complaint
router.post('/complaints', async (req, res) => {
    try {
        const complaint = new ComplaintModel(req.body);
        await complaint.save();
        res.status(200).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
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
    try {
        const userComplaints = await ComplaintModel.find({ userId: req.userId }); // Assuming the complaint schema has a `userId` field
        if (!userComplaints) {
            return res.status(404).json({ error: 'No complaints found for this user' });
        }
        res.json(userComplaints);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching complaints', details: err.message });
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
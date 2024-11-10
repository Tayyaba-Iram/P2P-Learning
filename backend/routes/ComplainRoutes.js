import express from 'express';
import ComplaintModel from '../models/Complain.js';

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

export default router;
import express from 'express';
import verifyUser from '../middleware/verifyUser.js';
import Repository from '../models/Repository.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import Request from '../models/ResourceRequest.js';

const router = express.Router();

router.post('/request-resource', verifyUser, async (req, res) => {
    const { repoId } = req.body;
  
    try {
      const repo = await Repository.findById(repoId);
      if (!repo) return res.status(404).json({ message: 'Repository not found' });
  
      const user = req.user;
      const receiver = await VerifiedStudentModel.findById(repo.uploadedBy);
      if (!receiver) return res.status(404).json({ message: 'Uploader not found' });
  
      const existing = await Request.findOne({
        senderEmail: user.email,
        repoId,
        receiverEmail: receiver.email
      });
  
      if (existing) {
        if (existing.status === 'Rejected') {
          await Request.deleteOne({ _id: existing._id });
        } else {
          // Don't allow duplicate if status is Pending or Accepted
          return res.status(400).json({ message: 'Request already sent' });
        }
      }
  
      const newRequest = new Request({
        senderName: user.name,
        senderEmail: user.email,
        repoTitle: repo.title,
        repoDescription: repo.description,
        repoId: repo._id,
        receiverEmail: receiver.email
      });
  
      await newRequest.save();
      res.status(201).json({ message: 'Request sent successfully', request: newRequest });
  
    } catch (err) {
      console.error('Send request error:', err);
      res.status(500).json({ message: 'Failed to send request' });
    }
  });
  

router.delete('/cancel-request/:repoId', verifyUser, async (req, res) => {
    const { repoId } = req.params;
    const user = req.user;
  
    try {
      const deleted = await Request.findOneAndDelete({
        senderEmail: user.email,
        repoId
      });
  
      if (!deleted) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (err) {
      console.error('Cancel request error:', err);
      res.status(500).json({ message: 'Failed to cancel request' });
    }
  });

  
router.get('/my-received-requests', verifyUser, async (req, res) => {
    try {
      const requests = await Request.find({
        receiverEmail: req.user.email,     
        senderEmail: { $ne: req.user.email } // Exclude self-sent requests
      });
      res.status(200).json(requests);
    } catch (err) {
      console.error('Fetch received requests error:', err);
      res.status(500).json({ message: 'Failed to fetch received requests' });
    }
  });
  
router.get('/my-resource-requests', verifyUser, async (req, res) => {
    try {
      const requests = await Request.find({ senderEmail: req.user.email }).select('repoId status');
      res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
 

  router.put('/requests/:requestId/accept', async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findByIdAndUpdate(
        requestId,
        { status: 'Accepted' }, 
        { new: true }
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.json(request);
    } catch (error) {
      console.error('Error accepting request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.put('/requests/:requestId/reject', async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findByIdAndUpdate(
        requestId,
        { status: 'Rejected' }, 
        { new: true }
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.json(request); 
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/requests/:requestId/resolve', async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findByIdAndUpdate(
        requestId,
        { status: 'Resolved' }, 
        { new: true } 
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.json(request); // Send back the updated request
    } catch (error) {
      console.error('Error resolving request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  export default router;
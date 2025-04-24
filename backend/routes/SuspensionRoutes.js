import express from 'express';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js';
import ComplaintModel from '../models/Complain.js';


const router=express.Router();
// POST route to suspend an account based on email from the complaint table
router.post('/suspend-account/:email', verifyUser, async (req, res) => {
    const email = req.params.email;
    console.log(`Received request to suspend account with email: ${email}`);  // Log the incoming request
  
    try {
      // Find the complaint by email
      const complaint = await ComplaintModel.findOne({ email });
  
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint with this email not found' });
      }
  
      // Find the user in VerifiedStudentModel based on email
      const user = await VerifiedStudentModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found in VerifiedStudentModel' });
      }
  
      // Suspend the user account
      user.accountStatus = 'Suspended';
      user.blocked = true;
      await user.save();
  
      // Send success response
      return res.json({ message: `Account with email ${email} has been suspended.` });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to suspend account.' });
    }
  });
  

// API to unsuspend a user based on Database ID (_id)
router.post('/unsuspend-account/:id', async (req, res) => {
  const id = req.params.id;  // Get the database ID from the URL parameters

  try {
    // Search for the user in the VerifiedStudent model by database ID (_id)
    const user = await VerifiedStudentModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Unsuspend the user's account by updating the status field
    user.accountStatus = 'Active';  // Reset status to 'Active'
    user.blocked = false;  // Set blocked flag to false (unblock the account)
    await user.save();

    // If needed, update the User model as well (if there are other account details to update)
    // await User.updateOne({ _id: id }, { $set: { accountStatus: 'Active' } });

    return res.json({ message: `Account with ID ${id} has been unsuspended.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to unsuspend account.' });
  }
});

export default router;
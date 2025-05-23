import express from 'express';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import verifyUser from '../middleware/verifyUser.js';
import ComplaintModel from '../models/Complain.js';

const router = express.Router();

router.post('/suspend-account/:email', verifyUser, async (req, res) => {
  const email = req.params.email.trim();
  console.log(`Received request to suspend account with email: ${email}`);

  try {
    const complaint = await ComplaintModel.findOne({ targetemail: email });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint with this target email not found' });
    }

    const user = await VerifiedStudentModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found in VerifiedStudentModel' });
    }

    user.accountStatus = 'Suspended';
    user.blocked = true;
    await user.save();

    return res.json({
      message: `Account with email ${email} has been suspended.`,
      user: user 
    });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to suspend account.' });
  }
});


router.post('/unsuspend-account/:email',verifyUser, async (req, res) => {
  const email = req.params.email.trim(); 
  console.log(`Received request to unsuspend account with email: ${email}`);

  try {
    const user = await VerifiedStudentModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found in VerifiedStudentModel' });
    }

    user.accountStatus = 'Active';
    user.blocked = false;
    await user.save();

    return res.json({
      message: `Account with email ${email} has been unsuspended.`,
      user: user 
    });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to unsuspend account.' });
  }
});

router.get('/user-status/:email', verifyUser,async (req, res) => {
  const { email } = req.params;

  try {
    const user = await VerifiedStudentModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ accountStatus: user.accountStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch user status.' });
  }
});


export default router;

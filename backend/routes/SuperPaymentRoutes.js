import express from 'express';
import Account from '../models/SuperPayment.js';
import verifyUser from '../middleware/verifyUser.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import SessionModel from '../models/Session.js';

const router = express.Router();

router.post('/save-account', verifyUser, async (req, res) => {
    try {
        const { holder, number, balance = 0 } = req.body;  
        const existingAccount = await Account.findOne({ number });

        if (existingAccount) {
            existingAccount.balance = balance;
            await existingAccount.save();
            return res.status(200).json({ message: 'Account updated successfully', account: existingAccount });
        }

        const newAccount = new Account({ holder, number, balance });
        await newAccount.save();
  
        res.status(201).json({ message: 'Account saved successfully', account: newAccount });
    } catch (err) {
        console.error('Error saving account:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/get-account', verifyUser, async (req, res) => {
    try {
        const account = await Account.findOne(); 
        if (!account) {
            return res.status(404).json({ message: 'No account found' });
        }
        res.status(200).json(account);
    } catch (err) {
        console.error('Error fetching account:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/get-payment-details', verifyUser, async (req, res) => {
    try {
        const sessions = await SessionModel.find({ paymentMethod: { $ne: 'food' } }); // Filter out 'food' payments
        const students = await VerifiedStudentModel.find();

        if (sessions.length === 0) {
            const account = await Account.findOne();
            const currentBalance = account ? 0 : 0; 
            return res.json({
                message: 'No sessions found, current balance is 0',
                currentBalance: currentBalance
            });
        }

        let totalDeductedAmount = 0;
        let deductedOnce = false; 

        const combinedData = await Promise.all(sessions.map(async (session) => {
            const student = students.find(std => std.email === session.userEmail);

            // Calculate the amount after 10% deduction
            const amountAfterDeduction = session.amount * 0.9; // Subtracting 10%

            // Add to the total deducted amount only once for the first session
            if (!deductedOnce) {
                totalDeductedAmount += (session.amount - amountAfterDeduction);
                deductedOnce = true;  // Deduction happens only once for the first session
            }

            return {
                ...session._doc,
                studentName: student?.name,
                studentId: student?.sapid,
                university: student?.university,
                program: student?.program,
                phoneNumber: student?.phone,
                amountAfterDeduction: amountAfterDeduction,  // Adding the deducted amount without modifying the actual session data
                actualAmount: session.amount  // Showing the actual amount without change
            };
        }));

        // Fetch the updated account balance after processing
        const account = await Account.findOne();
        let currentBalance = account ? account.balance : 0;

        // Update the current balance by adding the total deducted amount
        currentBalance += totalDeductedAmount;

        if (account) {
            account.balance = currentBalance;
            await account.save();
        }

        res.json({
            sessions: combinedData,
            currentBalance: Math.round(currentBalance)  // Round the balance to avoid decimals
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions with student data and updating balance', error });
    }
});

export default router;

import express from 'express';
import Account from '../models/SuperPayment.js';
import verifyUser from '../middleware/verifyUser.js';
import VerifiedStudentModel from '../models/VerifiedStudent.js';
import SessionModel from '../models/Session.js';

const router = express.Router();

// Save account dynamically
router.post('/save-account', verifyUser, async (req, res) => {
    try {
        const { holder, number, balance = 0 } = req.body;  // Default balance to 10000 if not provided
        
        // Check if the account already exists based on number
        const existingAccount = await Account.findOne({ number });

        if (existingAccount) {
            // If the account exists, update the balance
            existingAccount.balance = balance;
            await existingAccount.save();
            return res.status(200).json({ message: 'Account updated successfully', account: existingAccount });
        }

        // If the account doesn't exist, create a new one
        const newAccount = new Account({ holder, number, balance });
        await newAccount.save();
  
        res.status(201).json({ message: 'Account saved successfully', account: newAccount });
    } catch (err) {
        console.error('Error saving account:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch saved account data
router.get('/get-account', verifyUser, async (req, res) => {
    try {
        const account = await Account.findOne(); // Assuming you want to fetch one account for simplicity
        if (!account) {
            return res.status(404).json({ message: 'No account found' });
        }
        res.status(200).json(account);
    } catch (err) {
        console.error('Error fetching account:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch session payments and update the account balance
router.get('/get-payment-details', verifyUser, async (req, res) => {
    try {
        const sessions = await SessionModel.find({ paymentMethod: { $ne: 'food' } }); // Filter out 'food' payments
        const students = await VerifiedStudentModel.find();

        // If no sessions are added, set the balance to 0
        if (sessions.length === 0) {
            const account = await Account.findOne();
            const currentBalance = account ? 0 : 0; // Default balance is 0 if no sessions
            return res.json({
                message: 'No sessions found, current balance is 0',
                currentBalance: currentBalance
            });
        }

        // Calculate the total deducted amount and process the sessions
        let totalDeductedAmount = 0;
        let deductedOnce = false; // Flag to ensure deduction happens only once

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

        // Save the updated account balance in the database
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

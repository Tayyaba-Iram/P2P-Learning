import express from 'express';
import SuperAdminModel from '../models/Superadmin.js';

const router = express.Router();

router.post('/superadmin-check-or-create', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if any super admin accounts exist in the database
        const superAdminExists = await SuperAdminModel.countDocuments();

        if (superAdminExists > 0) {
            // If an account exists, check if the email matches
            const superAdmin = await SuperAdminModel.findOne({ email });

            if (superAdmin) {
                // Verify existing super admin login
                if (password === superAdmin.password) {
                    res.json({ success: true, created: false });
                } else {
                    res.json({ success: false, message: 'Incorrect password' });
                }
            } else {
                // Email does not match any existing account
                res.json({ success: false, message: 'No account associated with this email' });
            }
        } else {
            // No accounts exist, create a new super admin
            const newSuperAdmin = new SuperAdminModel({ email, password });
            await newSuperAdmin.save();
            res.json({ success: true, created: true });
        }
    } catch (error) {
        console.error('Error checking or creating Super Admin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
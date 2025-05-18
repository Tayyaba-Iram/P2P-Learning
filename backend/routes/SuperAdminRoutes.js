import express from 'express';
import SuperAdminModel from '../models/Superadmin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
    );
};

router.post('/superadmin-check-or-create', async (req, res) => {
    const { email, password } = req.body;
    console.log('Received data:', { email, password });

    try {
        // Check if any super admin accounts exist in the database
        const superAdminExists = await SuperAdminModel.countDocuments();

        if (superAdminExists > 0) {
            // If an account exists, check if the email matches
            const superAdmin = await SuperAdminModel.findOne({ email });

            if (superAdmin) {
                // Verify existing super admin login
                if (password === superAdmin.password) {
                    // Create JWT token for the super admin
                    const token = generateToken(superAdmin);

                    res.json({
                        success: true,
                        created: false,
                        message: 'Login successful.',
                        token,
                        user: { email: superAdmin.email }
                    });
                } else {
                    return res.json({ success: false, message: 'Incorrect password' });
                }
            } else {
                // Email does not match any existing account
                return res.json({ success: false, message: 'No account associated with this email' });
            }
        } else {
            // No super admin accounts exist, create a new super admin
            const newSuperAdmin = new SuperAdminModel({ email, password });
            await newSuperAdmin.save();

            console.log("email: ", newSuperAdmin.email);

            const token = generateToken(newSuperAdmin);
            console.log("Generated token:", token);
            res.json({
                success: true,
                created: true,
                message: 'Super admin account created successfully.',
                token,
                user: { email: newSuperAdmin.email }
            });
        }
    } catch (error) {
        console.error('Error checking or creating Super Admin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;

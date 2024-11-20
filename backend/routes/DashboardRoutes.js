import express from 'express';
import verifyUser from '../middleware/verifyUser.js'; // Import the middleware

const router = express.Router();

router.get('/student-dashboard', verifyUser, (req, res) => {
  // If the token is verified, the username and email will be available in the request object
  res.json({
    success: true,
    message: 'Welcome to your dashboard!',
    user: {
      name: req.user.name,
      email: req.user.email
    }
  });
});


router.get('/admin-dashboard', verifyUser, (req, res) => {
  // If the token is verified, the username and email will be available in the request object
  res.json({
    success: true,
    message: 'Welcome to your dashboard!',
    user: {
      name: req.user.name,
      email: req.user.email
    }
  });
});


router.get('/superadmin-dashboard', verifyUser, (req, res) => {
  // If the token is verified, the username and email will be available in the request object
  res.json({
    success: true,
    message: 'Welcome to your dashboard!',
    user: {
      email: req.email
    }
  });
});

export default router;

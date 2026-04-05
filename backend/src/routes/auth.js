import express from 'express';
import passport from 'passport';
import { register, login, getMe, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    googleCallback
);

export default router;

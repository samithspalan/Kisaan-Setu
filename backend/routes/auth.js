import express from 'express';
import rateLimit from 'express-rate-limit';
import { singUp, login, logout, getUser, updateUser, googleLogin } from '../controller.js/auth.js';
import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later" }
});

// Authentication Routes
router.post('/signup', authLimiter, singUp);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getUser);
router.put('/me', isAuthenticated, updateUser);
router.post('/google', authLimiter, googleLogin);

export default router;

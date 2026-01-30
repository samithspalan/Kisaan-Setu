import express from 'express';
import { singUp as signUp, login, logout, getUser, googleLogin } from '../controller.js/auth.js';
import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication Routes
router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getUser);
router.post('/google', googleLogin);

export default router;

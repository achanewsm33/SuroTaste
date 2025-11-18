import express from 'express';
import { register, login, 
  googleRedirect,
  googleCallback, } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get('/google', googleRedirect); // Server-side OAuth flow
router.get('/google/callback', googleCallback); // OAuth callback


export default router;
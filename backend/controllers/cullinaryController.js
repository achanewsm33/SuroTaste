import express from 'express';
import { getCulinaryData } from '../controllers/culinaryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getCulinaryData);

export default router;
import express from 'express';
import { generateForm } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate-form', protect, generateForm);

export default router;

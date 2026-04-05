import express from 'express';
import {
    submitResponse,
    getFormResponses,
    exportResponses,
} from '../controllers/responseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/:formId', submitResponse);

// Protected routes
router.get('/form/:formId', protect, getFormResponses);
router.get('/export/:formId', protect, exportResponses);

export default router;

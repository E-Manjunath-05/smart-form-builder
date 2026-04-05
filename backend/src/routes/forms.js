import express from 'express';
import {
    getForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    publishForm,
    getFormByShareLink,
} from '../controllers/formController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', protect, getForms);
router.post('/', protect, createForm);
router.get('/:id', protect, getForm);
router.put('/:id', protect, updateForm);
router.delete('/:id', protect, deleteForm);
router.post('/:id/publish', protect, publishForm);

// Public route
router.get('/share/:shareLink', getFormByShareLink);

export default router;

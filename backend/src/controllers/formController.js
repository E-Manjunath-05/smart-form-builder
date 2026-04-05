import Form from '../models/Form.js';
import QRCode from 'qrcode';

// @desc    Get all forms for a user
// @route   GET /api/forms
// @access  Private
export const getForms = async (req, res) => {
    try {
        const forms = await Form.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (error) {
        console.error('Get forms error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single form
// @route   GET /api/forms/:id
// @access  Private
export const getForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Check if user owns the form
        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this form' });
        }

        res.json(form);
    } catch (error) {
        console.error('Get form error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new form
// @route   POST /api/forms
// @access  Private
export const createForm = async (req, res) => {
    try {
        const { title, description, questions, deadline } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Form title is required' });
        }

        const form = await Form.create({
            userId: req.user._id,
            title,
            description: description || '',
            questions: questions || [],
            deadline: deadline || null,
        });

        res.status(201).json(form);
    } catch (error) {
        console.error('Create form error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update form
// @route   PUT /api/forms/:id
// @access  Private
export const updateForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Check if user owns the form
        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this form' });
        }

        const { title, description, questions, deadline } = req.body;

        form.title = title || form.title;
        form.description = description !== undefined ? description : form.description;
        form.questions = questions || form.questions;
        if (deadline !== undefined) form.deadline = deadline;

        const updatedForm = await form.save();
        res.json(updatedForm);
    } catch (error) {
        console.error('Update form error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete form
// @route   DELETE /api/forms/:id
// @access  Private
export const deleteForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Check if user owns the form
        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this form' });
        }

        await form.deleteOne();
        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Delete form error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish form and generate QR code
// @route   POST /api/forms/:id/publish
// @access  Private
export const publishForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Check if user owns the form
        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to publish this form' });
        }

        // Generate share link if not exists
        if (!form.shareLink) {
            form.generateShareLink();
        }

        // Generate QR code
        const formUrl = `${process.env.FRONTEND_URL}/forms/${form.shareLink}`;
        const qrCodeDataUrl = await QRCode.toDataURL(formUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        form.qrCode = qrCodeDataUrl;
        form.isPublished = true;

        const publishedForm = await form.save();
        res.json(publishedForm);
    } catch (error) {
        console.error('Publish form error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get form by share link (public)
// @route   GET /api/forms/share/:shareLink
// @access  Public
export const getFormByShareLink = async (req, res) => {
    try {
        const form = await Form.findOne({ shareLink: req.params.shareLink });

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (!form.isPublished) {
            return res.status(403).json({ message: 'This form is not published' });
        }

        // Return form without sensitive data
        res.json({
            _id: form._id,
            title: form.title,
            description: form.description,
            questions: form.questions,
            deadline: form.deadline,
        });
    } catch (error) {
        console.error('Get form by share link error:', error);
        res.status(500).json({ message: error.message });
    }
};

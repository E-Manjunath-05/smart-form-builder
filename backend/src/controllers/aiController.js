import { generateFormFromDescription } from '../services/aiService.js';

// @desc    Generate form from AI description
// @route   POST /api/ai/generate-form
// @access  Private
export const generateForm = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim().length === 0) {
            return res.status(400).json({ message: 'Description is required' });
        }

        if (description.length > 2000) {
            return res.status(400).json({ message: 'Description is too long (max 2000 characters)' });
        }

        const generatedForm = await generateFormFromDescription(description);

        res.json({
            title: generatedForm.title,
            description: generatedForm.description,
            questions: generatedForm.questions,
            message: 'Form generated successfully',
        });
    } catch (error) {
        console.error('Generate form error:', error);
        res.status(500).json({ message: 'Failed to generate form. Please try again.' });
    }
};

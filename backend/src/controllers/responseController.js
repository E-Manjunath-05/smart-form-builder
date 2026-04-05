import Response from '../models/Response.js';
import Form from '../models/Form.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

// @desc    Submit form response
// @route   POST /api/responses/:formId
// @access  Public
export const submitResponse = async (req, res) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;

        // Check if form exists and is published
        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (!form.isPublished) {
            return res.status(403).json({ message: 'This form is not accepting responses' });
        }

        // Check if deadline has passed
        if (form.deadline && new Date() > new Date(form.deadline)) {
            return res.status(403).json({ message: 'The deadline for this form has passed' });
        }

        // Validate answers
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid response data' });
        }

        // Get IP address
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Create response
        const response = await Response.create({
            formId,
            answers,
            ipAddress,
        });

        res.status(201).json({
            message: 'Response submitted successfully',
            responseId: response._id
        });
    } catch (error) {
        console.error('Submit response error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all responses for a form
// @route   GET /api/responses/form/:formId
// @access  Private
export const getFormResponses = async (req, res) => {
    try {
        const { formId } = req.params;

        // Check if form exists and user owns it
        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view these responses' });
        }

        // Get all responses
        const responses = await Response.find({ formId }).sort({ submittedAt: -1 });

        res.json({
            form: {
                _id: form._id,
                title: form.title,
                description: form.description,
                questions: form.questions,
            },
            responses,
            totalResponses: responses.length,
        });
    } catch (error) {
        console.error('Get form responses error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export responses as CSV
// @route   GET /api/responses/export/:formId
// @access  Private
export const exportResponses = async (req, res) => {
    try {
        const { formId } = req.params;

        // Check if form exists and user owns it
        const form = await Form.findById(formId);

        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (form.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to export these responses' });
        }

        // Get all responses
        const responses = await Response.find({ formId }).sort({ submittedAt: -1 });

        if (responses.length === 0) {
            return res.status(404).json({ message: 'No responses found for this form' });
        }

        // Prepare CSV headers
        const headers = [
            { id: 'submittedAt', title: 'Submitted At' },
            { id: 'ipAddress', title: 'IP Address' },
        ];

        // Add question headers
        form.questions.forEach((question) => {
            headers.push({
                id: question.questionId,
                title: question.label,
            });
        });

        // Prepare CSV data
        const records = responses.map((response) => {
            const record = {
                submittedAt: new Date(response.submittedAt).toLocaleString(),
                ipAddress: response.ipAddress || 'N/A',
            };

            // Add answers
            response.answers.forEach((answer) => {
                const value = Array.isArray(answer.answer)
                    ? answer.answer.join(', ')
                    : answer.answer;
                record[answer.questionId] = value;
            });

            return record;
        });

        // Create CSV file
        const fileName = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses_${Date.now()}.csv`;
        const filePath = path.join(process.cwd(), 'exports', fileName);

        // Ensure exports directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
            fs.mkdirSync(path.join(process.cwd(), 'exports'));
        }

        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: headers,
        });

        await csvWriter.writeRecords(records);

        // Send file
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Delete file after download
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Export responses error:', error);
        res.status(500).json({ message: error.message });
    }
};

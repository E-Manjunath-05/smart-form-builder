import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true,
    },
    questionLabel: {
        type: String,
        required: true,
    },
    answer: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
        required: true,
    },
});

const responseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
        index: true,
    },
    answers: [answerSchema],
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
        default: '',
    },
});

const Response = mongoose.model('Response', responseSchema);

export default Response;

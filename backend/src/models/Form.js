import mongoose from 'mongoose';
import crypto from 'crypto';

const questionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(8).toString('hex'),
    },
    type: {
        type: String,
        required: true,
        enum: ['text', 'email', 'tel', 'number', 'textarea', 'radio', 'checkbox', 'select', 'date'],
    },
    label: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        default: '',
    },
    required: {
        type: Boolean,
        default: false,
    },
    validation: {
        pattern: String,
        min: Number,
        max: Number,
        minLength: Number,
        maxLength: Number,
        errorMessage: String,
    },
    options: [{
        value: String,
        label: String,
    }],
    order: {
        type: Number,
        default: 0,
    },
});

const formSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Form title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    deadline: {
        type: Date,
        default: null,
    },
    questions: [questionSchema],
    isPublished: {
        type: Boolean,
        default: false,
    },
    shareLink: {
        type: String,
        unique: true,
        sparse: true,
    },
    qrCode: {
        type: String, // Base64 encoded QR code
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
formSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Generate unique share link before publishing
formSchema.methods.generateShareLink = function () {
    if (!this.shareLink) {
        this.shareLink = crypto.randomBytes(12).toString('hex');
    }
    return this.shareLink;
};

const Form = mongoose.model('Form', formSchema);

export default Form;

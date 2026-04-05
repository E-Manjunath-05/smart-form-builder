import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import connectDB from './src/config/database.js';
import configurePassport from './src/config/passport.js';
import errorHandler from './src/middleware/errorHandler.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import formRoutes from './src/routes/forms.js';
import responseRoutes from './src/routes/responses.js';
import aiRoutes from './src/routes/ai.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure Passport
configurePassport();

// Middleware
const frontendUrl = process.env.FRONTEND_URL || 'https://smart-form-builder-ten.vercel.app';
// Normalize: remove trailing slash if present
const allowedOrigin = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (required for Passport)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Smart Form Builder API',
        version: '1.0.0',
        status: 'running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/ai', aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

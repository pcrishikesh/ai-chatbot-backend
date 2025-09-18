/**
 * Main Server File - Chat Backend Application
 * 
 * This is the entry point of our Express.js server for the MERN stack chat application.
 * It sets up the server, connects to MongoDB, and configures all middleware and routes.
 * 
 * Learning Objectives:
 * - Understanding Express.js server setup
 * - Middleware configuration (CORS, JSON parsing, etc.)
 * - Route organization and mounting
 * - Error handling basics
 * - Environment variable usage
 * 
 * @author Your Name
 * @version 1.0.0
 */

// Import required packages
import express from 'express';           // Web framework for Node.js
import mongoose from 'mongoose';         // MongoDB object modeling tool
import cors from 'cors';                 // Enable Cross-Origin Resource Sharing
import dotenv from 'dotenv';             // Load environment variables from .env file

// Import our custom modules
import { connectDB } from './configs/database.js';   // Database configuration
import { validateOpenRouterConfig } from './services/aiService.js';  // AI service validation
import authRoutes from './routes/authRoutes.js';     // Authentication routes
import chatRoutes from './routes/chatRoutes.js';     // Chat-related routes
import healthRoutes from './routes/healthRoutes.js'; // Health check routes

// Load environment variables from .env file
// This allows us to keep sensitive information (like database URLs) out of our code
dotenv.config();

// Create Express application instance
const app = express();

// Define the port number - use environment variable or default to 3001
const PORT = process.env.PORT || 3200;

/**
 * MIDDLEWARE CONFIGURATION
 * 
 * Middleware functions are executed in the order they are defined.
 * They can modify the request and response objects, or end the request-response cycle.
 */

// CORS (Cross-Origin Resource Sharing) middleware
// This allows our frontend (running on different port) to communicate with this backend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',  // Frontend URL
    credentials: true  // Allow cookies and authorization headers
}));

// Body parsing middleware
// This parses incoming request bodies in JSON format
app.use(express.json({ limit: '10mb' }));  // Limit JSON payload size to 10MB

// URL-encoded body parsing middleware
// This parses incoming request bodies in URL-encoded format
app.use(express.urlencoded({ extended: true }));

/**
 * ROUTE MOUNTING
 * 
 * We organize our routes into separate files for better code organization.
 * Each route file handles a specific functionality (auth, chat, etc.)
 */

// Mount authentication routes at /api/auth
// Example: POST /api/auth/login, POST /api/auth/signup
app.use('/api/auth', authRoutes);

// Mount chat routes at /api/chat
// Example: POST /api/chat/message, GET /api/chat/history
app.use('/api/chat', chatRoutes);

// Mount health check routes at /api/health
// Example: GET /api/health, GET /api/health/detailed
app.use('/api/health', healthRoutes);

/**
 * BASIC ROUTE FOR TESTING
 * 
 * This is a simple route to test if our server is running correctly.
 * It's useful for debugging and health checks.
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Chat Backend Server is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * ERROR HANDLING MIDDLEWARE
 * 
 * This middleware catches any errors that occur in our routes.
 * It should be defined after all other middleware and routes.
 */
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

/**
 * 404 HANDLER
 * 
 * This middleware handles requests to routes that don't exist.
 * It should be defined after all other routes but before error handling.
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

/**
 * DATABASE CONNECTION
 * 
 * We connect to MongoDB using our database configuration module.
 * The connection is handled by the connectDB function from configs/database.js.
 */

/**
 * SERVER STARTUP
 * 
 * This function starts our Express server after connecting to the database.
 */
const startServer = async () => {
    try {
        // First, connect to the database
        await connectDB();
        
        // Check AI service configuration
        const aiConfigCheck = validateOpenRouterConfig();
        if (aiConfigCheck.success) {
            console.log('✅ OpenRouter AI service configured');
        } else {
            console.warn('⚠️ OpenRouter AI service not configured:', aiConfigCheck.message);
            console.log('💡 Set OPENROUTER_API_KEY in your .env file to enable AI features');
        }
        
        // Then start the server
        app.listen(PORT, () => {
            console.log('🚀 Server started successfully!');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log('📚 Available endpoints:');
            console.log('   - GET  / (health check)');
            console.log('   - GET  /api/health (basic health)');
            console.log('   - GET  /api/health/detailed (comprehensive health)');
            console.log('   - GET  /api/health/ai (AI service health)');
            console.log('   - GET  /api/health/database (database health)');
            console.log('   - POST /api/auth/login');
            console.log('   - POST /api/auth/signup');
            console.log('   - POST /api/auth/logout');
            console.log('   - POST /api/chat/message');
            console.log('   - GET  /api/chat/history');
            console.log('   - POST /api/chat/new');
            console.log('   - DELETE /api/chat/:id');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections (like database connection errors)
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    // Close server and exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

// Start the server
startServer();

// Export the app for testing purposes
export default app;

/**
 * Database Configuration File
 * 
 * This file contains database connection settings and configurations.
 * It's separated from the main app.js for better organization and reusability.
 * 
 * Learning Objectives:
 * - Database connection management
 * - Environment variable usage
 * - Error handling for database operations
 * - Connection event handling
 * 
 * @author Your Name
 * @version 1.0.0
 */

import mongoose from 'mongoose';

/**
 * Database Connection Configuration
 * 
 * This object contains all the database connection options.
 * These options help optimize the connection for our application.
 */
const dbOptions = {
    // Use the new URL parser (required for newer versions of MongoDB)
    useNewUrlParser: true,
    
    // Use the new server discovery and monitoring engine
    useUnifiedTopology: true,
    
    // Maximum number of connections in the connection pool
    maxPoolSize: 10,
    
    // Maximum time to wait for a connection to be established
    serverSelectionTimeoutMS: 5000,
    
    // Maximum time to wait for a socket connection
    socketTimeoutMS: 45000,
    
    // Maximum time to wait for a database operation
    maxIdleTimeMS: 30000,
};

/**
 * Connect to MongoDB Database
 * 
 * This function establishes a connection to the MongoDB database.
 * It uses environment variables for the connection string and handles connection events.
 * 
 * @returns {Promise<void>} - Promise that resolves when connection is established
 * 
 * @example
 * // Usage in app.js
 * const { connectDB } = require('./configs/database');
 * await connectDB();
 */
const connectDB = async () => {
    try {
        // Get MongoDB connection string from environment variable
        // If not set, use local MongoDB instance
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';
        
        console.log('🔄 Connecting to MongoDB...');
        console.log(`📡 Connection string: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
        
        // Establish connection to MongoDB
        const connection = await mongoose.connect(mongoURI, dbOptions);
        
        // Log successful connection
        console.log('✅ MongoDB connected successfully!');
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}`);
        console.log(`🔌 Port: ${connection.connection.port}`);
        
        // Set up connection event listeners
        setupConnectionListeners(connection.connection);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('💡 Make sure MongoDB is running and the connection string is correct');
        
        // Exit the process if database connection fails
        // This prevents the server from running without a database
        process.exit(1);
    }
};

/**
 * Setup Database Connection Event Listeners
 * 
 * This function sets up event listeners for various database connection events.
 * These listeners help us monitor the database connection status.
 * 
 * @param {Object} connection - Mongoose connection object
 * 
 * @example
 * // This function is called automatically when connecting to the database
 * setupConnectionListeners(mongoose.connection);
 */
const setupConnectionListeners = (connection) => {
    // Event: Connection opened
    connection.on('connected', () => {
        console.log('🔗 Mongoose connected to MongoDB');
    });
    
    // Event: Connection error
    connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });
    
    // Event: Connection disconnected
    connection.on('disconnected', () => {
        console.log('🔌 Mongoose disconnected from MongoDB');
    });
    
    // Event: Process termination (Ctrl+C)
    process.on('SIGINT', async () => {
        console.log('\n🔄 Closing MongoDB connection...');
        await connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    });
    
    // Event: Process termination (kill command)
    process.on('SIGTERM', async () => {
        console.log('\n🔄 Closing MongoDB connection...');
        await connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    });
};

/**
 * Get Database Connection Status
 * 
 * This function returns the current status of the database connection.
 * It's useful for health checks and monitoring.
 * 
 * @returns {Object} - Connection status information
 * 
 * @example
 * // Usage for health check endpoint
 * const status = getConnectionStatus();
 * console.log(status); // { connected: true, readyState: 1, host: 'localhost', port: 27017 }
 */
const getConnectionStatus = () => {
    const connection = mongoose.connection;
    
    return {
        connected: connection.readyState === 1,
        readyState: connection.readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name,
        collections: Object.keys(connection.collections)
    };
};

/**
 * Close Database Connection
 * 
 * This function gracefully closes the database connection.
 * It's useful for testing or when you need to close the connection manually.
 * 
 * @returns {Promise<void>} - Promise that resolves when connection is closed
 * 
 * @example
 * // Usage in tests or cleanup
 * const { closeDB } = require('./configs/database');
 * await closeDB();
 */
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
};

// Export functions for use in other files
export {
    connectDB,
    getConnectionStatus,
    closeDB,
    setupConnectionListeners
};

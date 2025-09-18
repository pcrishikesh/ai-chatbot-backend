/**
 * Health Check Controller
 * 
 * This controller provides health check endpoints for monitoring the application.
 * It checks database connectivity, AI service status, and overall system health.
 * 
 * Learning Objectives:
 * - Understanding health check endpoints
 * - System monitoring and diagnostics
 * - External service status checking
 * - Error handling for monitoring
 * - API status reporting
 * 
 * @author Your Name
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import { testOpenRouterConnection, validateOpenRouterConfig } from '../services/aiService.js';

/**
 * Basic Health Check
 * 
 * This endpoint provides basic application health information.
 * It's useful for load balancers and monitoring systems.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/health
 * // Response: { status: "healthy", timestamp: "2023-...", uptime: 12345 }
 */
export const basicHealthCheck = async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        };
        
        res.status(200).json(healthData);
        
    } catch (error) {
        console.error('❌ Health check error:', error);
        
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
};

/**
 * Detailed Health Check
 * 
 * This endpoint provides detailed health information including database and AI service status.
 * It's useful for debugging and comprehensive system monitoring.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/health/detailed
 * // Response: { status: "healthy", services: { database: "connected", ai: "connected" } }
 */
export const detailedHealthCheck = async (req, res) => {
    try {
        console.log('🔍 Performing detailed health check...');
        
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services: {}
        };
        
        // Check database connection
        const dbStatus = await checkDatabaseHealth();
        healthData.services.database = dbStatus;
        
        // Check AI service configuration
        const aiConfigStatus = validateOpenRouterConfig();
        healthData.services.ai = {
            configured: aiConfigStatus.success,
            message: aiConfigStatus.message
        };
        
        // If AI is configured, test the connection
        if (aiConfigStatus.success) {
            const aiTestResult = await testOpenRouterConnection();
            healthData.services.ai.connected = aiTestResult.success;
            healthData.services.ai.details = aiTestResult.details;
        }
        
        // Determine overall health status
        const allServicesHealthy = Object.values(healthData.services).every(service => {
            if (service.connected !== undefined) {
                return service.connected;
            }
            return service.status === 'connected' || service.configured;
        });
        
        healthData.status = allServicesHealthy ? 'healthy' : 'degraded';
        
        const statusCode = allServicesHealthy ? 200 : 503;
        
        console.log(`✅ Health check completed: ${healthData.status}`);
        res.status(statusCode).json(healthData);
        
    } catch (error) {
        console.error('❌ Detailed health check error:', error);
        
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                database: { status: 'unknown' },
                ai: { status: 'unknown' }
            }
        });
    }
};

/**
 * AI Service Health Check
 * 
 * This endpoint specifically checks the AI service status.
 * It's useful for debugging AI-related issues.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/health/ai
 * // Response: { status: "connected", model: "meta-llama/llama-3.1-8b-instruct:free" }
 */
export const aiHealthCheck = async (req, res) => {
    try {
        console.log('🤖 Checking AI service health...');
        
        // Validate configuration
        const configCheck = validateOpenRouterConfig();
        if (!configCheck.success) {
            return res.status(503).json({
                status: 'unhealthy',
                message: 'AI service not configured',
                details: configCheck.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Test AI service connection
        const testResult = await testOpenRouterConnection();
        
        if (testResult.success) {
            res.status(200).json({
                status: 'healthy',
                message: 'AI service is operational',
                details: testResult.details,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'unhealthy',
                message: 'AI service is not responding',
                details: testResult.details,
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('❌ AI health check error:', error);
        
        res.status(500).json({
            status: 'unhealthy',
            message: 'AI service health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Database Health Check
 * 
 * This endpoint specifically checks the database connection status.
 * It's useful for debugging database-related issues.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/health/database
 * // Response: { status: "connected", database: "chat-app", host: "localhost" }
 */
export const databaseHealthCheck = async (req, res) => {
    try {
        console.log('🗄️ Checking database health...');
        
        const dbStatus = await checkDatabaseHealth();
        
        if (dbStatus.status === 'connected') {
            res.status(200).json({
                status: 'healthy',
                message: 'Database is connected',
                details: dbStatus,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'unhealthy',
                message: 'Database is not connected',
                details: dbStatus,
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.error('❌ Database health check error:', error);
        
        res.status(500).json({
            status: 'unhealthy',
            message: 'Database health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Check Database Health
 * 
 * This helper function checks the MongoDB database connection status.
 * It provides detailed information about the database connection.
 * 
 * @returns {Promise<Object>} - Database health information
 * 
 * @example
 * // Usage in health check endpoints
 * const dbStatus = await checkDatabaseHealth();
 * console.log('Database status:', dbStatus.status);
 */
const checkDatabaseHealth = async () => {
    try {
        const connection = mongoose.connection;
        
        // Check connection state
        if (connection.readyState === 1) {
            return {
                status: 'connected',
                database: connection.name,
                host: connection.host,
                port: connection.port,
                readyState: connection.readyState,
                collections: Object.keys(connection.collections).length
            };
        } else {
            return {
                status: 'disconnected',
                readyState: connection.readyState,
                message: 'Database connection is not established'
            };
        }
        
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return {
            status: 'error',
            error: error.message
        };
    }
};

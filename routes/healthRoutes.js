/**
 * Health Check Routes
 * 
 * This file defines health check endpoints for monitoring the application.
 * These endpoints are useful for load balancers, monitoring systems, and debugging.
 * 
 * Learning Objectives:
 * - Understanding health check endpoints
 * - System monitoring and diagnostics
 * - Route organization for monitoring
 * - Error handling in health checks
 * - API status reporting
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from 'express';
import {
    basicHealthCheck,
    detailedHealthCheck,
    aiHealthCheck,
    databaseHealthCheck
} from '../controllers/healthController.js';

// Create Express router instance
const router = express.Router();

/**
 * ROUTE DEFINITIONS
 * 
 * Each route provides different levels of health information:
 * - Basic: Simple status check
 * - Detailed: Comprehensive system status
 * - AI: AI service specific status
 * - Database: Database specific status
 */

/**
 * Basic Health Check Route
 * 
 * This route provides basic application health information.
 * It's lightweight and suitable for frequent monitoring.
 * 
 * @route GET /api/health
 * @access Public
 * @returns {Object} Basic health status
 * 
 * @example
 * // Request
 * GET /api/health
 * 
 * // Response
 * {
 *   "status": "healthy",
 *   "timestamp": "2023-12-01T10:00:00.000Z",
 *   "uptime": 12345,
 *   "version": "1.0.0",
 *   "environment": "development"
 * }
 */
router.get('/', basicHealthCheck);

/**
 * Detailed Health Check Route
 * 
 * This route provides comprehensive health information including all services.
 * It's useful for debugging and detailed system monitoring.
 * 
 * @route GET /api/health/detailed
 * @access Public
 * @returns {Object} Detailed health status with service information
 * 
 * @example
 * // Request
 * GET /api/health/detailed
 * 
 * // Response
 * {
 *   "status": "healthy",
 *   "timestamp": "2023-12-01T10:00:00.000Z",
 *   "uptime": 12345,
 *   "version": "1.0.0",
 *   "environment": "development",
 *   "services": {
 *     "database": {
 *       "status": "connected",
 *       "database": "chat-app",
 *       "host": "localhost",
 *       "port": 27017
 *     },
 *     "ai": {
 *       "configured": true,
 *       "connected": true,
 *       "message": "OpenRouter configuration is valid"
 *     }
 *   }
 * }
 */
router.get('/detailed', detailedHealthCheck);

/**
 * AI Service Health Check Route
 * 
 * This route specifically checks the AI service status.
 * It's useful for debugging AI-related issues.
 * 
 * @route GET /api/health/ai
 * @access Public
 * @returns {Object} AI service health status
 * 
 * @example
 * // Request
 * GET /api/health/ai
 * 
 * // Response
 * {
 *   "status": "healthy",
 *   "message": "AI service is operational",
 *   "details": {
 *     "model": "meta-llama/llama-3.1-8b-instruct:free",
 *     "responseLength": 25
 *   },
 *   "timestamp": "2023-12-01T10:00:00.000Z"
 * }
 */
router.get('/ai', aiHealthCheck);

/**
 * Database Health Check Route
 * 
 * This route specifically checks the database connection status.
 * It's useful for debugging database-related issues.
 * 
 * @route GET /api/health/database
 * @access Public
 * @returns {Object} Database health status
 * 
 * @example
 * // Request
 * GET /api/health/database
 * 
 * // Response
 * {
 *   "status": "healthy",
 *   "message": "Database is connected",
 *   "details": {
 *     "status": "connected",
 *     "database": "chat-app",
 *     "host": "localhost",
 *     "port": 27017,
 *     "collections": 2
 *   },
 *   "timestamp": "2023-12-01T10:00:00.000Z"
 * }
 */
router.get('/database', databaseHealthCheck);

/**
 * ROUTE DOCUMENTATION
 * 
 * This section provides a summary of all available health check routes.
 */

/**
 * Available Health Check Routes:
 * 
 * 1. GET /api/health
 *    - Basic health check
 *    - Returns: Basic application status
 *    - Use case: Load balancer health checks
 * 
 * 2. GET /api/health/detailed
 *    - Comprehensive health check
 *    - Returns: Detailed status of all services
 *    - Use case: System monitoring and debugging
 * 
 * 3. GET /api/health/ai
 *    - AI service health check
 *    - Returns: AI service status and configuration
 *    - Use case: Debugging AI-related issues
 * 
 * 4. GET /api/health/database
 *    - Database health check
 *    - Returns: Database connection status
 *    - Use case: Debugging database issues
 * 
 * Note: All health check routes are public and do not require authentication.
 */

// Export the router for use in the main app
export default router;

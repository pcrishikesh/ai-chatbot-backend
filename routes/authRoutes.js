/**
 * Authentication Routes
 * 
 * This file defines all authentication-related API routes.
 * It handles user registration, login, logout, and profile management.
 * 
 * Learning Objectives:
 * - Understanding Express.js routing
 * - Route organization and structure
 * - Middleware integration
 * - HTTP method usage (GET, POST, PUT, DELETE)
 * - Route parameters and query strings
 * - Error handling in routes
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from 'express';
import { 
    signup, 
    login, 
    logout, 
    getProfile, 
    authenticateToken 
} from '../controllers/authController.js';

// Create Express router instance
const router = express.Router();

/**
 * ROUTE DEFINITIONS
 * 
 * Each route definition includes:
 * - HTTP method (GET, POST, PUT, DELETE)
 * - Route path
 * - Middleware functions (optional)
 * - Controller function
 * - Documentation comments
 */

/**
 * User Registration Route
 * 
 * This route handles new user registration.
 * It accepts user data and creates a new account.
 * 
 * @route POST /api/auth/signup
 * @access Public
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} User data and JWT token
 * 
 * @example
 * // Request
 * POST /api/auth/signup
 * Content-Type: application/json
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "User registered successfully",
 *   "data": {
 *     "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
 *     "token": "jwt-token-here"
 *   }
 * }
 */
router.post('/signup', signup);

/**
 * User Login Route
 * 
 * This route handles user authentication.
 * It verifies credentials and returns a JWT token.
 * 
 * @route POST /api/auth/login
 * @access Public
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} User data and JWT token
 * 
 * @example
 * // Request
 * POST /api/auth/login
 * Content-Type: application/json
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
 *     "token": "jwt-token-here"
 *   }
 * }
 */
router.post('/login', login);

/**
 * User Logout Route
 * 
 * This route handles user logout.
 * In a JWT-based system, logout is typically handled client-side.
 * 
 * @route POST /api/auth/logout
 * @access Private (requires authentication)
 * @returns {Object} Success message
 * 
 * @example
 * // Request
 * POST /api/auth/logout
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */
router.post('/logout', authenticateToken, logout);

/**
 * Get User Profile Route
 * 
 * This route returns the current authenticated user's profile.
 * It's useful for getting user information after login.
 * 
 * @route GET /api/auth/profile
 * @access Private (requires authentication)
 * @returns {Object} User profile data
 * 
 * @example
 * // Request
 * GET /api/auth/profile
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Profile retrieved successfully",
 *   "data": {
 *     "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
 *   }
 * }
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * Verify Token Route
 * 
 * This route verifies if a JWT token is valid.
 * It's useful for checking authentication status.
 * 
 * @route GET /api/auth/verify
 * @access Private (requires authentication)
 * @returns {Object} Token verification result
 * 
 * @example
 * // Request
 * GET /api/auth/verify
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Token is valid",
 *   "data": {
 *     "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
 *   }
 * }
 */
router.get('/verify', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user.getPublicProfile()
        }
    });
});

/**
 * ROUTE DOCUMENTATION
 * 
 * This section provides a summary of all available routes for easy reference.
 */

/**
 * Available Authentication Routes:
 * 
 * 1. POST /api/auth/signup
 *    - Register a new user
 *    - Body: { name, email, password }
 *    - Returns: User data and JWT token
 * 
 * 2. POST /api/auth/login
 *    - Authenticate existing user
 *    - Body: { email, password }
 *    - Returns: User data and JWT token
 * 
 * 3. POST /api/auth/logout
 *    - Logout current user
 *    - Headers: Authorization: Bearer <token>
 *    - Returns: Success message
 * 
 * 4. GET /api/auth/profile
 *    - Get current user profile
 *    - Headers: Authorization: Bearer <token>
 *    - Returns: User profile data
 * 
 * 5. GET /api/auth/verify
 *    - Verify JWT token validity
 *    - Headers: Authorization: Bearer <token>
 *    - Returns: Token verification result
 */

// Export the router for use in the main app
export default router;

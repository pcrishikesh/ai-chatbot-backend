/**
 * Authentication Controller
 * 
 * This file contains all authentication-related controller functions.
 * It handles user registration, login, logout, and authentication middleware.
 * 
 * Learning Objectives:
 * - Understanding Express.js controllers
 * - Request/Response handling
 * - Password hashing and verification
 * - JWT token generation and validation
 * - Error handling in controllers
 * - Input validation and sanitization
 * 
 * @author Your Name
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * JWT Configuration
 * 
 * These constants define JWT token settings.
 * In production, these should be stored in environment variables.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

console.log('🔧 JWT_SECRET configured:', JWT_SECRET ? 'Yes' : 'No');
console.log('🔧 JWT_EXPIRES_IN:', JWT_EXPIRES_IN);

/**
 * Generate JWT Token
 * 
 * This helper function creates a JWT token for a user.
 * The token contains user information and expires after a specified time.
 * 
 * @param {Object} user - User object containing id and email
 * @returns {string} - JWT token string
 * 
 * @example
 * // Usage in login controller
 * const token = generateToken({ id: user._id, email: user.email });
 */
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN 
    });
    
    console.log('🔑 Generated JWT token:', token.substring(0, 20) + '...');
    console.log('🔑 Token payload:', payload);
    
    return token;
};

/**
 * User Registration Controller
 * 
 * This controller handles new user registration.
 * It validates input, checks for existing users, hashes the password,
 * and creates a new user account.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // POST /api/auth/signup
 * // Body: { name: "John Doe", email: "john@example.com", password: "password123" }
 */
export const signup = async (req, res) => {
    try {
        console.log('🔄 User signup attempt:', req.body.email);
        
        // Extract user data from request body
        const { name, email, password } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });
        
        // Save user to database (password will be hashed by pre-save middleware)
        await newUser.save();
        
        // Generate JWT token
        const token = generateToken(newUser);
        
        // Get user profile without password
        const userProfile = newUser.getPublicProfile();
        
        console.log('✅ User registered successfully:', newUser.email);
        
        // Send success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userProfile,
                token: token
            }
        });
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

/**
 * User Login Controller
 * 
 * This controller handles user authentication.
 * It validates credentials, verifies the password, and returns a JWT token.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // POST /api/auth/login
 * // Body: { email: "john@example.com", password: "password123" }
 */
export const login = async (req, res) => {
    try {
        console.log('🔄 User login attempt:', req.body.email);
        
        // Extract login credentials from request body
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        // Find user by email (include password for verification)
        const user = await User.findByEmail(email, true);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        // Get user profile without password
        const userProfile = user.getPublicProfile();
        
        console.log('✅ User logged in successfully:', user.email);
        
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userProfile,
                token: token
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

/**
 * User Logout Controller
 * 
 * This controller handles user logout.
 * In a JWT-based system, logout is typically handled on the client side
 * by removing the token, but we can also maintain a blacklist of tokens.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // POST /api/auth/logout
 * // Headers: { Authorization: "Bearer <token>" }
 */
export const logout = async (req, res) => {
    try {
        console.log('🔄 User logout attempt:', req.user?.email);
        
        // In a simple implementation, we just send a success response
        // The client should remove the token from storage
        
        // In a more advanced implementation, you could:
        // 1. Add the token to a blacklist
        // 2. Store blacklisted tokens in Redis or database
        // 3. Check blacklist in authentication middleware
        
        console.log('✅ User logged out successfully:', req.user?.email);
        
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

/**
 * Get Current User Profile Controller
 * 
 * This controller returns the current authenticated user's profile.
 * It's useful for getting user information after login.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/auth/profile
 * // Headers: { Authorization: "Bearer <token>" }
 */
export const getProfile = async (req, res) => {
    try {
        console.log('🔄 Getting user profile:', req.user?.email);
        
        // User information is already available from auth middleware
        const userProfile = req.user.getPublicProfile();
        
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: userProfile
            }
        });
        
    } catch (error) {
        console.error('❌ Get profile error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving profile'
        });
    }
};

/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens and adds user information to the request object.
 * It should be used to protect routes that require authentication.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>} - Calls next() or sends error response
 * 
 * @example
 * // Usage in routes
 * router.get('/protected', authenticateToken, (req, res) => {
 *     // req.user will contain the authenticated user
 * });
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        console.log('🔍 Auth header:', authHeader);
        
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        console.log('🔍 Extracted token:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        
        // Check if token looks like a JWT (has 3 parts separated by dots)
        const tokenParts = token.split('.');
        console.log('🔍 Token analysis:');
        console.log('   Full token:', token);
        console.log('   Token length:', token.length);
        console.log('   Token parts count:', tokenParts.length);
        console.log('   Token parts:', tokenParts.map((part, i) => `Part ${i+1}: ${part.substring(0, 20)}...`));
        
        if (tokenParts.length !== 3) {
            console.log('❌ Invalid token format - not a JWT');
            console.log('   Expected 3 parts, got:', tokenParts.length);
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user by ID from token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }
        
        // Add user to request object
        req.user = user;
        
        console.log('✅ Token verified for user:', user.email);
        next();
        
    } catch (error) {
        console.error('❌ Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
};

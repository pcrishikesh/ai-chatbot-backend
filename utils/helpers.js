/**
 * Helper Utilities
 * 
 * This file contains common utility functions used throughout the application.
 * These functions help with data validation, formatting, and common operations.
 * 
 * Learning Objectives:
 * - Understanding utility functions
 * - Code reusability and organization
 * - Input validation and sanitization
 * - Date and string manipulation
 * - Error handling in utilities
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * Validate Email Format
 * 
 * This function validates if an email address has the correct format.
 * It uses a regular expression to check the email structure.
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 * 
 * @example
 * // Usage in controllers
 * if (!isValidEmail(email)) {
 *     return res.status(400).json({ message: 'Invalid email format' });
 * }
 */
export const isValidEmail = (email) => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate Password Strength
 * 
 * This function validates if a password meets the minimum requirements.
 * It checks for length and basic complexity.
 * 
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with success boolean and message
 * 
 * @example
 * // Usage in controllers
 * const passwordValidation = validatePassword(password);
 * if (!passwordValidation.success) {
 *     return res.status(400).json({ message: passwordValidation.message });
 * }
 */
export const validatePassword = (password) => {
    // Check minimum length
    if (password.length < 6) {
        return {
            success: false,
            message: 'Password must be at least 6 characters long'
        };
    }
    
    // Check maximum length
    if (password.length > 128) {
        return {
            success: false,
            message: 'Password cannot exceed 128 characters'
        };
    }
    
    // Check for at least one letter and one number (optional enhancement)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
        return {
            success: false,
            message: 'Password must contain at least one letter and one number'
        };
    }
    
    return {
        success: true,
        message: 'Password is valid'
    };
};

/**
 * Sanitize Input String
 * 
 * This function cleans and sanitizes user input strings.
 * It removes extra whitespace and potentially harmful characters.
 * 
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 * 
 * @example
 * // Usage in controllers
 * const cleanName = sanitizeInput(req.body.name);
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return '';
    }
    
    return input
        .trim()                    // Remove leading/trailing whitespace
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .substring(0, 1000);       // Limit length to prevent abuse
};

/**
 * Format Date for Display
 * 
 * This function formats a date object into a human-readable string.
 * It provides different formats based on the date's age.
 * 
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 * 
 * @example
 * // Usage in controllers
 * const formattedDate = formatDate(new Date());
 * // Returns: "Just now", "2 hours ago", "3 days ago", etc.
 */
export const formatDate = (date) => {
    if (!date || !(date instanceof Date)) {
        return 'Unknown';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Less than 1 minute
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    // Less than 1 hour
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // More than 7 days - show actual date
    return date.toLocaleDateString();
};

/**
 * Generate Random String
 * 
 * This function generates a random string of specified length.
 * It's useful for creating unique IDs, tokens, or filenames.
 * 
 * @param {number} length - The length of the random string
 * @returns {string} - Random string
 * 
 * @example
 * // Usage in controllers
 * const messageId = generateRandomString(10);
 * // Returns: "aB3xY9mK2p"
 */
export const generateRandomString = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
};

/**
 * Validate ObjectId Format
 * 
 * This function validates if a string is a valid MongoDB ObjectId.
 * It checks the format and length of the ID.
 * 
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 * 
 * @example
 * // Usage in controllers
 * if (!isValidObjectId(chatId)) {
 *     return res.status(400).json({ message: 'Invalid chat ID format' });
 * }
 */
export const isValidObjectId = (id) => {
    // MongoDB ObjectId is 24 characters long and contains only hexadecimal characters
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Pagination Helper
 * 
 * This function calculates pagination parameters for database queries.
 * It ensures valid page and limit values and calculates skip value.
 * 
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {Object} - Pagination parameters
 * 
 * @example
 * // Usage in controllers
 * const pagination = calculatePagination(req.query.page, req.query.limit);
 * const chats = await Chat.find().skip(pagination.skip).limit(pagination.limit);
 */
export const calculatePagination = (page = 1, limit = 20, maxLimit = 100) => {
    // Ensure page is a positive integer
    const currentPage = Math.max(1, parseInt(page) || 1);
    
    // Ensure limit is within bounds
    const currentLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));
    
    // Calculate skip value
    const skip = (currentPage - 1) * currentLimit;
    
    return {
        page: currentPage,
        limit: currentLimit,
        skip: skip
    };
};

/**
 * Error Response Helper
 * 
 * This function creates standardized error responses.
 * It ensures consistent error format across all endpoints.
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} - Standardized error response
 * 
 * @example
 * // Usage in controllers
 * return res.status(400).json(createErrorResponse('Invalid input', 400, { field: 'email' }));
 */
export const createErrorResponse = (message, statusCode = 500, details = null) => {
    const errorResponse = {
        success: false,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    if (details) {
        errorResponse.details = details;
    }
    
    return errorResponse;
};

/**
 * Success Response Helper
 * 
 * This function creates standardized success responses.
 * It ensures consistent success format across all endpoints.
 * 
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Standardized success response
 * 
 * @example
 * // Usage in controllers
 * return res.status(200).json(createSuccessResponse('Data retrieved successfully', { users: [] }));
 */
export const createSuccessResponse = (message, data = null, statusCode = 200) => {
    const successResponse = {
        success: true,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    if (data) {
        successResponse.data = data;
    }
    
    return successResponse;
};

/**
 * Log Request Helper
 * 
 * This function logs incoming requests for debugging and monitoring.
 * It provides consistent logging format across the application.
 * 
 * @param {Object} req - Express request object
 * @param {string} action - Action being performed
 * 
 * @example
 * // Usage in controllers
 * logRequest(req, 'User login attempt');
 */
export const logRequest = (req, action) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - ${action}`);
    console.log(`  IP: ${ip}`);
    console.log(`  User-Agent: ${userAgent}`);
    
    if (req.user) {
        console.log(`  User: ${req.user.email}`);
    }
};

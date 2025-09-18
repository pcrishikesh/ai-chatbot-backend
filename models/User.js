/**
 * User Model - MongoDB Schema Definition
 * 
 * This file defines the User schema for our MongoDB database using Mongoose.
 * It includes user authentication fields, validation rules, and middleware functions.
 * 
 * Learning Objectives:
 * - Understanding Mongoose schemas and models
 * - Data validation and sanitization
 * - Password hashing with bcrypt
 * - Schema middleware (pre/post hooks)
 * - Virtual fields and methods
 * - Indexing for performance
 * 
 * @author Your Name
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema Definition
 * 
 * This schema defines the structure of user documents in our MongoDB collection.
 * Each field has specific validation rules and data types.
 * 
 * Schema Fields:
 * - name: User's full name (required, string)
 * - email: User's email address (required, unique, validated)
 * - password: User's hashed password (required, string)
 * - createdAt: Timestamp when user was created (auto-generated)
 * - updatedAt: Timestamp when user was last updated (auto-generated)
 */
const userSchema = new mongoose.Schema({
    /**
     * User's Full Name
     * 
     * This field stores the user's complete name.
     * It's required and must be between 2 and 50 characters.
     */
    name: {
        type: String,                    // Data type: String
        required: [true, 'Name is required'],  // Required field with custom error message
        trim: true,                      // Remove whitespace from beginning and end
        minlength: [2, 'Name must be at least 2 characters long'],  // Minimum length validation
        maxlength: [50, 'Name cannot exceed 50 characters']         // Maximum length validation
    },
    
    /**
     * User's Email Address
     * 
     * This field stores the user's email address.
     * It's required, must be unique, and must be a valid email format.
     */
    email: {
        type: String,                    // Data type: String
        required: [true, 'Email is required'],  // Required field with custom error message
        unique: true,                    // Ensure email is unique across all users
        lowercase: true,                 // Convert to lowercase before saving
        trim: true,                      // Remove whitespace
        match: [                         // Email format validation using regex
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Regex pattern for valid email
            'Please provide a valid email address'  // Custom error message
        ]
    },
    
    /**
     * User's Password
     * 
     * This field stores the user's hashed password.
     * The actual password is never stored in plain text for security.
     */
    password: {
        type: String,                    // Data type: String
        required: [true, 'Password is required'],  // Required field
        minlength: [6, 'Password must be at least 6 characters long'],  // Minimum length
        select: false                    // Don't include password in queries by default (security)
    }
}, {
    /**
     * Schema Options
     * 
     * These options configure how the schema behaves.
     */
    timestamps: true,                    // Automatically add createdAt and updatedAt fields
    versionKey: false                    // Don't include __v field in documents
});

/**
 * PRE-SAVE MIDDLEWARE
 * 
 * This middleware runs before saving a user document to the database.
 * It automatically hashes the password before saving.
 * 
 * Learning Points:
 * - Middleware functions run at specific points in the document lifecycle
 * - 'this' refers to the document being saved
 * - We only hash the password if it's been modified (for efficiency)
 * - bcrypt is used for secure password hashing
 */
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();  // Skip hashing if password hasn't changed
    }
    
    try {
        // Hash the password with a salt rounds of 12
        // Higher salt rounds = more secure but slower
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        
        console.log('🔐 Password hashed successfully for user:', this.email);
        next();  // Continue with the save operation
        
    } catch (error) {
        console.error('❌ Error hashing password:', error);
        next(error);  // Pass error to next middleware
    }
});

/**
 * INSTANCE METHODS
 * 
 * These methods are available on individual user documents.
 * They provide functionality specific to each user instance.
 */

/**
 * Compare Password Method
 * 
 * This method compares a plain text password with the hashed password stored in the database.
 * It's used during login to verify the user's password.
 * 
 * @param {string} candidatePassword - The plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 * 
 * @example
 * // Usage in login controller
 * const user = await User.findOne({ email }).select('+password');
 * const isMatch = await user.comparePassword(password);
 * if (isMatch) {
 *     // Login successful
 * }
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Compare the candidate password with the stored hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        
        console.log(`🔍 Password comparison for ${this.email}: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        return isMatch;
        
    } catch (error) {
        console.error('❌ Error comparing password:', error);
        return false;  // Return false on error for security
    }
};

/**
 * Get Public Profile Method
 * 
 * This method returns user data without sensitive information like password.
 * It's useful for sending user data to the frontend.
 * 
 * @returns {Object} - User object without password
 * 
 * @example
 * // Usage in controllers
 * const user = await User.findById(userId);
 * const publicProfile = user.getPublicProfile();
 * res.json({ success: true, user: publicProfile });
 */
userSchema.methods.getPublicProfile = function() {
    // Convert mongoose document to plain object
    const userObject = this.toObject();
    
    // Remove sensitive fields
    delete userObject.password;
    delete userObject.__v;
    
    return userObject;
};

/**
 * STATIC METHODS
 * 
 * These methods are available on the User model itself, not on individual documents.
 * They provide functionality that works with the entire collection.
 */

/**
 * Find User by Email
 * 
 * This static method finds a user by email address.
 * It's a convenience method that can be used throughout the application.
 * 
 * @param {string} email - The email address to search for
 * @param {boolean} includePassword - Whether to include password in the result
 * @returns {Promise<Object|null>} - User document or null if not found
 * 
 * @example
 * // Usage in login controller
 * const user = await User.findByEmail(email, true); // Include password for login
 * const user = await User.findByEmail(email, false); // Exclude password for profile
 */
userSchema.statics.findByEmail = async function(email, includePassword = false) {
    try {
        const query = User.findOne({ email: email.toLowerCase() });
        
        // Include password if requested (for login)
        if (includePassword) {
            query.select('+password');
        }
        
        const user = await query.exec();
        return user;
        
    } catch (error) {
        console.error('❌ Error finding user by email:', error);
        return null;
    }
};

/**
 * VIRTUAL FIELDS
 * 
 * Virtual fields are computed properties that don't exist in the database
 * but can be accessed like regular fields.
 */

/**
 * User's Initials
 * 
 * This virtual field returns the user's initials based on their name.
 * It's computed automatically and doesn't take up database space.
 * 
 * @returns {string} - User's initials (e.g., "John Doe" -> "JD")
 */
userSchema.virtual('initials').get(function() {
    if (!this.name) return '';
    
    return this.name
        .split(' ')                    // Split name into words
        .map(word => word.charAt(0))   // Get first character of each word
        .join('')                      // Join characters together
        .toUpperCase();                // Convert to uppercase
});

/**
 * INDEXES
 * 
 * Indexes improve query performance by creating optimized data structures.
 * We create indexes on fields that are frequently queried.
 */

// Create index on email field for faster lookups
userSchema.index({ email: 1 });

// Create compound index on email and name for complex queries
userSchema.index({ email: 1, name: 1 });

/**
 * Create and Export the User Model
 * 
 * This creates the User model from the schema and exports it for use in other files.
 * The model name 'User' will create a collection named 'users' in MongoDB.
 */
const User = mongoose.model('User', userSchema);

// Export the model for use in other files
export default User;

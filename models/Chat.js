/**
 * Chat Model - MongoDB Schema Definition
 * 
 * This file defines the Chat schema for our MongoDB database using Mongoose.
 * It handles chat conversations, messages, and user relationships.
 * 
 * Learning Objectives:
 * - Understanding nested schemas and subdocuments
 * - Reference relationships between collections
 * - Array handling in MongoDB
 * - Timestamp management
 * - Schema validation for complex data structures
 * 
 * @author Your Name
 * @version 1.0.0
 */

import mongoose from 'mongoose';

/**
 * Message Subdocument Schema
 * 
 * This schema defines the structure of individual messages within a chat.
 * It's embedded as a subdocument in the Chat schema.
 * 
 * Schema Fields:
 * - content: The message text content
 * - sender: Who sent the message ('user' or 'ai')
 * - timestamp: When the message was sent
 * - messageId: Unique identifier for the message
 */
const messageSchema = new mongoose.Schema({
    /**
     * Message Content
     * 
     * The actual text content of the message.
     * Required and must be between 1 and 5000 characters.
     */
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        minlength: [1, 'Message cannot be empty'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    
    /**
     * Message Sender
     * 
     * Indicates who sent the message.
     * Can be 'user' (human user) or 'ai' (AI assistant).
     */
    sender: {
        type: String,
        required: [true, 'Message sender is required'],
        enum: {
            values: ['user', 'ai'],
            message: 'Sender must be either "user" or "ai"'
        }
    },
    
    /**
     * Message Timestamp
     * 
     * When the message was created.
     * Defaults to current time if not provided.
     */
    timestamp: {
        type: Date,
        default: Date.now
    },
    
    /**
     * Message ID
     * 
     * Unique identifier for the message.
     * Used for message tracking and updates.
     */
    messageId: {
        type: String,
        required: true,
        unique: true
    }
}, {
    _id: false  // Don't create separate _id for subdocuments
});

/**
 * Chat Schema Definition
 * 
 * This schema defines the structure of chat documents in our MongoDB collection.
 * Each chat represents a conversation between a user and the AI.
 * 
 * Schema Fields:
 * - title: Chat conversation title
 * - userId: Reference to the user who owns this chat
 * - messages: Array of message subdocuments
 * - createdAt: When the chat was created
 * - updatedAt: When the chat was last updated
 * - isActive: Whether the chat is currently active
 */
const chatSchema = new mongoose.Schema({
    /**
     * Chat Title
     * 
     * A descriptive title for the chat conversation.
     * Usually generated from the first message or user input.
     */
    title: {
        type: String,
        required: [true, 'Chat title is required'],
        trim: true,
        maxlength: [100, 'Chat title cannot exceed 100 characters'],
        default: 'New Chat'
    },
    
    /**
     * User Reference
     * 
     * Reference to the user who owns this chat.
     * This creates a relationship between Chat and User collections.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to User document
        ref: 'User',                           // Points to User model
        required: [true, 'User ID is required'],
        index: true                            // Create index for faster queries
    },
    
    /**
     * Messages Array
     * 
     * Array of message subdocuments containing the conversation.
     * Each message follows the messageSchema structure.
     */
    messages: [messageSchema],
    
    /**
     * Chat Status
     * 
     * Indicates whether the chat is currently active.
     * Used for filtering and organization.
     */
    isActive: {
        type: Boolean,
        default: true
    },
    
    /**
     * Last Message Timestamp
     * 
     * Timestamp of the most recent message in the chat.
     * Used for sorting and displaying recent chats.
     */
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,  // Automatically add createdAt and updatedAt
    versionKey: false  // Don't include __v field
});

/**
 * PRE-SAVE MIDDLEWARE
 * 
 * This middleware runs before saving a chat document.
 * It updates the lastMessageAt field when messages are added.
 */
chatSchema.pre('save', function(next) {
    // Update lastMessageAt if there are messages
    if (this.messages && this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1];
        this.lastMessageAt = lastMessage.timestamp;
    }
    
    // Generate title from first message if not provided
    if (this.isNew && this.messages && this.messages.length > 0) {
        const firstMessage = this.messages[0];
        if (firstMessage.content) {
            this.title = firstMessage.content.substring(0, 50) + 
                        (firstMessage.content.length > 50 ? '...' : '');
        }
    }
    
    next();
});

/**
 * INSTANCE METHODS
 * 
 * Methods available on individual chat documents.
 */

/**
 * Add Message to Chat
 * 
 * This method adds a new message to the chat's messages array.
 * It automatically generates a unique message ID and updates timestamps.
 * 
 * @param {string} content - The message content
 * @param {string} sender - The sender ('user' or 'ai')
 * @returns {Object} - The added message object
 * 
 * @example
 * // Usage in chat controller
 * const chat = await Chat.findById(chatId);
 * const newMessage = chat.addMessage('Hello!', 'user');
 * await chat.save();
 */
chatSchema.methods.addMessage = function(content, sender) {
    // Generate unique message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new message object
    const newMessage = {
        content,
        sender,
        messageId,
        timestamp: new Date()
    };
    
    // Add message to the messages array
    this.messages.push(newMessage);
    
    // Update last message timestamp
    this.lastMessageAt = new Date();
    
    console.log(`💬 Message added to chat ${this._id}: ${sender} - ${content.substring(0, 50)}...`);
    
    return newMessage;
};

/**
 * Get Recent Messages
 * 
 * This method returns the most recent messages from the chat.
 * Useful for displaying chat history with pagination.
 * 
 * @param {number} limit - Number of recent messages to return
 * @returns {Array} - Array of recent messages
 * 
 * @example
 * // Usage in chat controller
 * const chat = await Chat.findById(chatId);
 * const recentMessages = chat.getRecentMessages(10);
 */
chatSchema.methods.getRecentMessages = function(limit = 50) {
    // Sort messages by timestamp (newest first) and limit results
    return this.messages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)
        .reverse(); // Reverse to get chronological order (oldest first)
};

/**
 * Get Message Count
 * 
 * This method returns the total number of messages in the chat.
 * 
 * @returns {number} - Total message count
 */
chatSchema.methods.getMessageCount = function() {
    return this.messages.length;
};

/**
 * STATIC METHODS
 * 
 * Methods available on the Chat model itself.
 */

/**
 * Find Chats by User
 * 
 * This static method finds all chats belonging to a specific user.
 * Results are sorted by last message timestamp (most recent first).
 * 
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of chats to return
 * @returns {Promise<Array>} - Array of user's chats
 * 
 * @example
 * // Usage in chat controller
 * const userChats = await Chat.findByUser(userId, 20);
 */
chatSchema.statics.findByUser = async function(userId, limit = 50) {
    try {
        const chats = await Chat.find({ userId })
            .sort({ lastMessageAt: -1 })  // Sort by last message (newest first)
            .limit(limit)
            .populate('userId', 'name email')  // Include user details
            .exec();
            
        console.log(`📋 Found ${chats.length} chats for user ${userId}`);
        return chats;
        
    } catch (error) {
        console.error('❌ Error finding chats by user:', error);
        return [];
    }
};

/**
 * Create New Chat
 * 
 * This static method creates a new chat for a user.
 * It initializes the chat with the first message.
 * 
 * @param {string} userId - The user's ID
 * @param {string} firstMessage - The first message content
 * @param {string} sender - The sender of the first message
 * @returns {Promise<Object>} - The created chat document
 * 
 * @example
 * // Usage in chat controller
 * const newChat = await Chat.createNew(userId, 'Hello!', 'user');
 */
chatSchema.statics.createNew = async function(userId, firstMessage, sender = 'user') {
    try {
        // Create new chat document
        const newChat = new Chat({
            userId,
            title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
            messages: [],
            isActive: true
        });
        
        // Add the first message
        newChat.addMessage(firstMessage, sender);
        
        // Save to database
        await newChat.save();
        
        console.log(`🆕 New chat created for user ${userId}: ${newChat._id}`);
        return newChat;
        
    } catch (error) {
        console.error('❌ Error creating new chat:', error);
        throw error;
    }
};

/**
 * VIRTUAL FIELDS
 * 
 * Computed properties that don't exist in the database.
 */

/**
 * Chat Duration
 * 
 * This virtual field calculates how long the chat has been active.
 * 
 * @returns {string} - Formatted duration string
 */
chatSchema.virtual('duration').get(function() {
    if (!this.createdAt) return 'Unknown';
    
    const now = new Date();
    const duration = now - this.createdAt;
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
});

/**
 * INDEXES
 * 
 * Indexes improve query performance on frequently accessed fields.
 */

// Compound index on userId and lastMessageAt for efficient user chat queries
chatSchema.index({ userId: 1, lastMessageAt: -1 });

// Index on isActive for filtering active chats
chatSchema.index({ isActive: 1 });

// Text index on title for search functionality
chatSchema.index({ title: 'text' });

/**
 * Create and Export the Chat Model
 * 
 * This creates the Chat model from the schema and exports it for use in other files.
 * The model name 'Chat' will create a collection named 'chats' in MongoDB.
 */
const Chat = mongoose.model('Chat', chatSchema);

// Export the model for use in other files
export default Chat;

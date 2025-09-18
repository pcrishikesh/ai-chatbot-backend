/**
 * Chat Controller
 * 
 * This file contains all chat-related controller functions.
 * It handles message sending, chat history retrieval, and chat management.
 * 
 * Learning Objectives:
 * - Understanding RESTful API design
 * - Database operations with Mongoose
 * - Request/Response handling
 * - Error handling and validation
 * - Authentication integration
 * - Data pagination and filtering
 * 
 * @author Your Name
 * @version 1.0.0
 */

import Chat from '../models/Chat.js';
import { generateAIResponse } from '../services/aiService.js';

/**
 * Send Message Controller
 * 
 * This controller handles sending messages in a chat conversation.
 * It can add messages to existing chats or create new chats.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // POST /api/chat/message
 * // Headers: { Authorization: "Bearer <token>" }
 * // Body: { message: "Hello!", chatId: "optional-chat-id" }
 */
export const sendMessage = async (req, res) => {
    try {
        console.log('🔄 Message send attempt from user:', req.user.email);
        
        // Extract message data from request body
        const { message, chatId } = req.body;
        const userId = req.user._id;
        
        // Validate required fields
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }
        
        // Validate message length
        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot exceed 5000 characters'
            });
        }
        
        let chat;
        
        // If chatId is provided, add message to existing chat
        if (chatId) {
            // Check if chatId is a valid MongoDB ObjectId
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);
            
            if (!isValidObjectId) {
                console.log('⚠️ Invalid chatId format, creating new chat instead:', chatId);
                // If chatId is not a valid ObjectId (e.g., timestamp), create new chat
                chat = new Chat({
                    userId: user._id,
                    title: message.trim().substring(0, 50) + '...',
                    messages: []
                });
                
                // Add user message to new chat
                chat.addMessage(message.trim(), 'user');
                await chat.save();
                
                console.log('✅ New chat created with message:', chat._id);
            } else {
                chat = await Chat.findOne({ _id: chatId, userId });
                
                if (!chat) {
                    return res.status(404).json({
                        success: false,
                        message: 'Chat not found or access denied'
                    });
                }
                
                // Add user message to existing chat
                chat.addMessage(message.trim(), 'user');
                await chat.save();
                
                console.log('✅ Message added to existing chat:', chatId);
            }
            
        } else {
            // Create new chat with first message
            chat = await Chat.createNew(userId, message.trim(), 'user');
            console.log('✅ New chat created with message');
        }
        
        // Generate AI response using OpenRouter API
        console.log('🤖 Generating AI response...');
        const aiResponse = await generateAIResponse(message, chat.messages);
        
        if (aiResponse.success) {
            // Add AI response to chat
            chat.addMessage(aiResponse.content, 'ai');
            await chat.save();
            console.log('✅ AI response added to chat');
        } else {
            // Handle AI service error
            console.error('❌ AI service error:', aiResponse.error);
            chat.addMessage(aiResponse.content, 'ai');
            await chat.save();
        }
        
        // Get recent messages for response
        const recentMessages = chat.getRecentMessages(20);
        
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                chatId: chat._id,
                messages: recentMessages,
                messageCount: chat.getMessageCount(),
                aiServiceStatus: aiResponse.success ? 'success' : 'error',
                aiError: aiResponse.success ? null : aiResponse.error
            }
        });
        
    } catch (error) {
        console.error('❌ Send message error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while sending message'
        });
    }
};

/**
 * Get Chat History Controller
 * 
 * This controller retrieves all chats for the authenticated user.
 * Results are sorted by last message timestamp (most recent first).
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/chat/history
 * // Headers: { Authorization: "Bearer <token>" }
 * // Query: ?limit=20&page=1
 */
export const getChatHistory = async (req, res) => {
    try {
        console.log('🔄 Getting chat history for user:', req.user.email);
        
        const userId = req.user._id;
        
        // Get query parameters for pagination
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        
        // Validate pagination parameters
        if (limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit cannot exceed 100'
            });
        }
        
        // Find user's chats with pagination
        const chats = await Chat.find({ userId, isActive: true })
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title lastMessageAt messageCount createdAt')
            .exec();
        
        // Get total count for pagination info
        const totalChats = await Chat.countDocuments({ userId, isActive: true });
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalChats / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        console.log(`✅ Retrieved ${chats.length} chats for user ${req.user.email}`);
        
        res.status(200).json({
            success: true,
            message: 'Chat history retrieved successfully',
            data: {
                chats: chats,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalChats: totalChats,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage,
                    limit: limit
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Get chat history error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving chat history'
        });
    }
};

/**
 * Get Specific Chat Controller
 * 
 * This controller retrieves a specific chat with all its messages.
 * It's used when a user opens a chat conversation.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // GET /api/chat/:chatId
 * // Headers: { Authorization: "Bearer <token>" }
 * // Query: ?limit=50
 */
export const getChat = async (req, res) => {
    try {
        console.log('🔄 Getting specific chat:', req.params.chatId);
        
        const { chatId } = req.params;
        const userId = req.user._id;
        const messageLimit = parseInt(req.query.limit) || 50;
        
        // Find the specific chat
        const chat = await Chat.findOne({ _id: chatId, userId });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied'
            });
        }
        
        // Get recent messages
        const messages = chat.getRecentMessages(messageLimit);
        
        console.log(`✅ Retrieved chat ${chatId} with ${messages.length} messages`);
        
        res.status(200).json({
            success: true,
            message: 'Chat retrieved successfully',
            data: {
                chat: {
                    id: chat._id,
                    title: chat.title,
                    createdAt: chat.createdAt,
                    lastMessageAt: chat.lastMessageAt,
                    messageCount: chat.getMessageCount(),
                    isActive: chat.isActive
                },
                messages: messages
            }
        });
        
    } catch (error) {
        console.error('❌ Get chat error:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving chat'
        });
    }
};

/**
 * Create New Chat Controller
 * 
 * This controller creates a new empty chat for the authenticated user.
 * The chat will be ready to receive the first message.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // POST /api/chat/new
 * // Headers: { Authorization: "Bearer <token>" }
 * // Body: { title: "Optional title" }
 */
export const createNewChat = async (req, res) => {
    try {
        console.log('🔄 Creating new chat for user:', req.user.email);
        
        const userId = req.user._id;
        const { title } = req.body;
        
        // Create new empty chat
        const newChat = new Chat({
            userId: userId,
            title: title || 'New Chat',
            messages: [],
            isActive: true
        });
        
        await newChat.save();
        
        console.log('✅ New chat created:', newChat._id);
        
        res.status(201).json({
            success: true,
            message: 'New chat created successfully',
            data: {
                chat: {
                    id: newChat._id,
                    title: newChat.title,
                    createdAt: newChat.createdAt,
                    messageCount: 0,
                    isActive: newChat.isActive
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Create new chat error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating new chat'
        });
    }
};

/**
 * Delete Chat Controller
 * 
 * This controller deletes a specific chat for the authenticated user.
 * The chat is marked as inactive rather than physically deleted.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // DELETE /api/chat/:chatId
 * // Headers: { Authorization: "Bearer <token>" }
 */
export const deleteChat = async (req, res) => {
    try {
        console.log('🔄 Deleting chat:', req.params.chatId);
        
        const { chatId } = req.params;
        const userId = req.user._id;
        
        // Find and update the chat (mark as inactive)
        const chat = await Chat.findOneAndUpdate(
            { _id: chatId, userId },
            { isActive: false },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied'
            });
        }
        
        console.log('✅ Chat deleted (marked inactive):', chatId);
        
        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully',
            data: {
                chatId: chat._id
            }
        });
        
    } catch (error) {
        console.error('❌ Delete chat error:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting chat'
        });
    }
};

/**
 * Update Chat Title Controller
 * 
 * This controller updates the title of a specific chat.
 * 
 * @param {Object} req - Express request object (with user from auth middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Sends JSON response
 * 
 * @example
 * // PUT /api/chat/:chatId/title
 * // Headers: { Authorization: "Bearer <token>" }
 * // Body: { title: "New Chat Title" }
 */
export const updateChatTitle = async (req, res) => {
    try {
        console.log('🔄 Updating chat title:', req.params.chatId);
        
        const { chatId } = req.params;
        const { title } = req.body;
        const userId = req.user._id;
        
        // Validate title
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Chat title is required'
            });
        }
        
        if (title.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Chat title cannot exceed 100 characters'
            });
        }
        
        // Find and update the chat title
        const chat = await Chat.findOneAndUpdate(
            { _id: chatId, userId },
            { title: title.trim() },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found or access denied'
            });
        }
        
        console.log('✅ Chat title updated:', chatId);
        
        res.status(200).json({
            success: true,
            message: 'Chat title updated successfully',
            data: {
                chat: {
                    id: chat._id,
                    title: chat.title
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Update chat title error:', error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating chat title'
        });
    }
};


/**
 * Chat Routes
 * 
 * This file defines all chat-related API routes.
 * It handles message sending, chat history, and chat management.
 * 
 * Learning Objectives:
 * - Understanding RESTful API design
 * - Route organization and structure
 * - Authentication middleware integration
 * - HTTP method usage for different operations
 * - Route parameters and query strings
 * - Error handling in routes
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from 'express';
import { authenticateToken } from '../controllers/authController.js';
import {
    sendMessage,
    getChatHistory,
    getChat,
    createNewChat,
    deleteChat,
    updateChatTitle
} from '../controllers/chatController.js';

// Create Express router instance
const router = express.Router();

/**
 * MIDDLEWARE
 * 
 * All chat routes require authentication.
 * The authenticateToken middleware is applied to all routes.
 */
router.use(authenticateToken);

/**
 * ROUTE DEFINITIONS
 * 
 * Each route definition includes:
 * - HTTP method (GET, POST, PUT, DELETE)
 * - Route path
 * - Controller function
 * - Documentation comments
 */

/**
 * Send Message Route
 * 
 * This route handles sending messages in a chat conversation.
 * It can add messages to existing chats or create new chats.
 * 
 * @route POST /api/chat/message
 * @access Private (requires authentication)
 * @param {string} message - The message content
 * @param {string} chatId - Optional chat ID (creates new chat if not provided)
 * @returns {Object} Chat data and messages
 * 
 * @example
 * // Request - Send message to existing chat
 * POST /api/chat/message
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * {
 *   "message": "Hello!",
 *   "chatId": "chat-id-here"
 * }
 * 
 * // Request - Send message to create new chat
 * POST /api/chat/message
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * {
 *   "message": "Hello!"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Message sent successfully",
 *   "data": {
 *     "chatId": "chat-id-here",
 *     "messages": [...],
 *     "messageCount": 2
 *   }
 * }
 */
router.post('/message', sendMessage);

/**
 * Get Chat History Route
 * 
 * This route retrieves all chats for the authenticated user.
 * Results are paginated and sorted by last message timestamp.
 * 
 * @route GET /api/chat/history
 * @access Private (requires authentication)
 * @param {number} limit - Number of chats to return (default: 20, max: 100)
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Object} Array of chats with pagination info
 * 
 * @example
 * // Request
 * GET /api/chat/history?limit=10&page=1
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Chat history retrieved successfully",
 *   "data": {
 *     "chats": [...],
 *     "pagination": {
 *       "currentPage": 1,
 *       "totalPages": 3,
 *       "totalChats": 25,
 *       "hasNextPage": true,
 *       "hasPrevPage": false,
 *       "limit": 10
 *     }
 *   }
 * }
 */
router.get('/history', getChatHistory);

/**
 * Get Specific Chat Route
 * 
 * This route retrieves a specific chat with all its messages.
 * It's used when a user opens a chat conversation.
 * 
 * @route GET /api/chat/:chatId
 * @access Private (requires authentication)
 * @param {string} chatId - The chat ID (URL parameter)
 * @param {number} limit - Number of messages to return (default: 50)
 * @returns {Object} Chat data and messages
 * 
 * @example
 * // Request
 * GET /api/chat/chat-id-here?limit=20
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Chat retrieved successfully",
 *   "data": {
 *     "chat": {
 *       "id": "chat-id-here",
 *       "title": "Chat Title",
 *       "createdAt": "2023-...",
 *       "lastMessageAt": "2023-...",
 *       "messageCount": 5,
 *       "isActive": true
 *     },
 *     "messages": [...]
 *   }
 * }
 */
router.get('/:chatId', getChat);

/**
 * Create New Chat Route
 * 
 * This route creates a new empty chat for the authenticated user.
 * The chat will be ready to receive the first message.
 * 
 * @route POST /api/chat/new
 * @access Private (requires authentication)
 * @param {string} title - Optional chat title (default: "New Chat")
 * @returns {Object} New chat data
 * 
 * @example
 * // Request
 * POST /api/chat/new
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * {
 *   "title": "My New Chat"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "New chat created successfully",
 *   "data": {
 *     "chat": {
 *       "id": "new-chat-id",
 *       "title": "My New Chat",
 *       "createdAt": "2023-...",
 *       "messageCount": 0,
 *       "isActive": true
 *     }
 *   }
 * }
 */
router.post('/new', createNewChat);

/**
 * Delete Chat Route
 * 
 * This route deletes a specific chat for the authenticated user.
 * The chat is marked as inactive rather than physically deleted.
 * 
 * @route DELETE /api/chat/:chatId
 * @access Private (requires authentication)
 * @param {string} chatId - The chat ID (URL parameter)
 * @returns {Object} Success message
 * 
 * @example
 * // Request
 * DELETE /api/chat/chat-id-here
 * Authorization: Bearer <jwt-token>
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Chat deleted successfully",
 *   "data": {
 *     "chatId": "chat-id-here"
 *   }
 * }
 */
router.delete('/:chatId', deleteChat);

/**
 * Update Chat Title Route
 * 
 * This route updates the title of a specific chat.
 * 
 * @route PUT /api/chat/:chatId/title
 * @access Private (requires authentication)
 * @param {string} chatId - The chat ID (URL parameter)
 * @param {string} title - New chat title
 * @returns {Object} Updated chat data
 * 
 * @example
 * // Request
 * PUT /api/chat/chat-id-here/title
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * {
 *   "title": "Updated Chat Title"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Chat title updated successfully",
 *   "data": {
 *     "chat": {
 *       "id": "chat-id-here",
 *       "title": "Updated Chat Title"
 *     }
 *   }
 * }
 */
router.put('/:chatId/title', updateChatTitle);

/**
 * ROUTE DOCUMENTATION
 * 
 * This section provides a summary of all available routes for easy reference.
 */

/**
 * Available Chat Routes:
 * 
 * 1. POST /api/chat/message
 *    - Send a message in a chat
 *    - Body: { message, chatId? }
 *    - Returns: Chat data and messages
 * 
 * 2. GET /api/chat/history
 *    - Get user's chat history
 *    - Query: ?limit=20&page=1
 *    - Returns: Array of chats with pagination
 * 
 * 3. GET /api/chat/:chatId
 *    - Get specific chat with messages
 *    - Query: ?limit=50
 *    - Returns: Chat data and messages
 * 
 * 4. POST /api/chat/new
 *    - Create new empty chat
 *    - Body: { title? }
 *    - Returns: New chat data
 * 
 * 5. DELETE /api/chat/:chatId
 *    - Delete a chat
 *    - Returns: Success message
 * 
 * 6. PUT /api/chat/:chatId/title
 *    - Update chat title
 *    - Body: { title }
 *    - Returns: Updated chat data
 * 
 * Note: All routes require authentication via JWT token in Authorization header.
 */

// Export the router for use in the main app
export default router;

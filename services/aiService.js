/**
 * AI Service - OpenRouter Integration
 * 
 * This service handles communication with OpenRouter's API to generate AI responses.
 * It provides a simple interface for sending messages and receiving AI-generated replies.
 * 
 * Learning Objectives:
 * - Understanding external API integration
 * - HTTP requests with fetch API
 * - Error handling for external services
 * - Environment variable usage
 * - API key management and security
 * - Response parsing and validation
 * 
 * @author Your Name
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Gemini API Configuration
 * 
 * These constants define the Gemini API settings.
 * They are loaded from environment variables for security.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Debug logging
console.log('🔧 AI Service - Environment Variables:');
console.log('  GEMINI_API_KEY:', GEMINI_API_KEY ? 'Set (' + GEMINI_API_KEY.substring(0, 20) + '...)' : 'Not set');
console.log('  GEMINI_MODEL:', GEMINI_MODEL);

/**
 * Validate Gemini Configuration
 * 
 * This function checks if all required Gemini configuration is present.
 * It should be called at application startup to ensure proper configuration.
 * 
 * @returns {Object} - Validation result with success boolean and message
 * 
 * @example
 * // Usage in app.js startup
 * const configCheck = validateGeminiConfig();
 * if (!configCheck.success) {
 *     console.warn('⚠️ Gemini not configured:', configCheck.message);
 * }
 */
export const validateGeminiConfig = () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
        return {
            success: false,
            message: 'GEMINI_API_KEY is not set or is using placeholder value. Please set a real API key from https://aistudio.google.com/app/apikey'
        };
    }
    
    if (!GEMINI_MODEL) {
        return {
            success: false,
            message: 'GEMINI_MODEL is not set in environment variables'
        };
    }
    
    return {
        success: true,
        message: 'Gemini configuration is valid'
    };
};

// Keep the old function name for backward compatibility
export const validateOpenRouterConfig = validateGeminiConfig;

/**
 * Test OpenRouter Connection
 * 
 * This function tests the OpenRouter API connection with a simple request.
 * Useful for debugging API key and configuration issues.
 * 
 * @returns {Promise<Object>} - Test result with success status
 */
export const testOpenRouterConnection = async () => {
    try {
        console.log('🧪 Testing OpenRouter connection...');
        
        const configCheck = validateOpenRouterConfig();
        if (!configCheck.success) {
            return {
                success: false,
                error: configCheck.message
            };
        }
        
        // Test with a simple request
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'Chat App - MERN Stack Learning Project'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message.'
                    }
                ],
                max_tokens: 50
            })
        });
        
        console.log('🔍 Test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ OpenRouter connection test successful');
            return {
                success: true,
                message: 'OpenRouter connection successful',
                data: data
            };
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ OpenRouter connection test failed:', response.status, errorData);
            return {
                success: false,
                error: `OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`
            };
        }
        
    } catch (error) {
        console.error('❌ OpenRouter connection test error:', error);
        return {
            success: false,
            error: `Connection test failed: ${error.message}`
        };
    }
};

/**
 * Generate AI Response using Gemini API
 * 
 * This function sends a user message to Gemini's API and returns the AI response.
 * It handles the complete request/response cycle including error handling.
 * 
 * @param {string} userMessage - The user's message to send to the AI
 * @param {Array} chatHistory - Previous messages in the conversation (optional)
 * @returns {Promise<Object>} - AI response with success status and content
 */
export const generateAIResponse = async (userMessage, chatHistory = []) => {
    try {
        console.log('🤖 Generating AI response for message:', userMessage.substring(0, 50) + '...');
        
        // Validate configuration
        const configCheck = validateOpenRouterConfig();
        if (!configCheck.success) {
            console.error('❌ Gemini configuration error:', configCheck.message);
            return {
                success: false,
                content: 'AI service is not configured. Please set up your Gemini API key in the .env file.',
                error: configCheck.message
            };
        }
        
        // Validate input
        if (!userMessage || userMessage.trim().length === 0) {
            return {
                success: false,
                content: 'Please provide a valid message.',
                error: 'Empty message provided'
            };
        }
        
        // Prepare conversation context
        let conversationText = '';
        
        // Add chat history if provided
        if (chatHistory && chatHistory.length > 0) {
            const recentHistory = chatHistory.slice(-10); // Limit to last 10 messages
            
            recentHistory.forEach(msg => {
                const role = msg.sender === 'user' ? 'User' : 'Assistant';
                conversationText += `${role}: ${msg.content}\n`;
            });
        }
        
        // Add current user message
        conversationText += `User: ${userMessage.trim()}`;
        
        // Prepare request payload for Gemini API
        const requestPayload = {
            contents: [
                {
                    parts: [
                        {
                            text: conversationText
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000
            }
        };
        
        console.log('📤 Sending request to Gemini API...');
        
        // Make API request to Gemini
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify(requestPayload)
        });
        
        // Check if request was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Gemini API error:', response.status, errorData);
            
            // Handle specific error cases
            if (response.status === 401) {
                return {
                    success: false,
                    content: 'AI service authentication failed. Please check API key configuration.',
                    error: 'Invalid API key'
                };
            } else if (response.status === 429) {
                return {
                    success: false,
                    content: 'AI service is currently busy. Please try again in a moment.',
                    error: 'Rate limit exceeded'
                };
            } else if (response.status >= 500) {
                return {
                    success: false,
                    content: 'AI service is temporarily unavailable. Please try again later.',
                    error: 'Server error'
                };
            } else {
                return {
                    success: false,
                    content: 'Failed to get AI response. Please try again.',
                    error: `API error: ${response.status} - ${JSON.stringify(errorData)}`
                };
            }
        }
        
        // Parse the response
        const responseData = await response.json();
        console.log('✅ Gemini API response received');
        
        // Extract the AI response
        if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content) {
            const aiResponse = responseData.candidates[0].content.parts[0].text;
            
            console.log('✅ AI response generated successfully');
            console.log('   Response length:', aiResponse.length);
            console.log('   Response preview:', aiResponse.substring(0, 100) + '...');
            
            return {
                success: true,
                content: aiResponse,
                usage: responseData.usageMetadata || null
            };
        } else {
            console.error('❌ No response content found in API response');
            return {
                success: false,
                content: 'AI service returned an unexpected response format.',
                error: 'Invalid response format'
            };
        }
        
    } catch (error) {
        console.error('❌ AI service error:', error);
        return {
            success: false,
            content: 'AI service is temporarily unavailable. Please try again later.',
            error: error.message
        };
    }
};

/**
 * Get Available Models
 * 
 * This function retrieves the list of available models from OpenRouter.
 * It's useful for debugging and model selection.
 * 
 * @returns {Promise<Object>} - Available models or error information
 * 
 * @example
 * // Usage for debugging
 * const models = await getAvailableModels();
 * console.log('Available models:', models);
 */
export const getAvailableModels = async () => {
    try {
        console.log('📋 Fetching available models from OpenRouter...');
        
        const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            success: true,
            models: data.data || [],
            currentModel: OPENROUTER_MODEL
        };
        
    } catch (error) {
        console.error('❌ Error fetching models:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

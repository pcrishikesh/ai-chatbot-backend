/**
 * Test Gemini API Integration
 * 
 * This script tests the Gemini API connection to verify everything is working.
 */

import dotenv from 'dotenv';
import { generateAIResponse, validateGeminiConfig } from './services/aiService.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Gemini API Integration...\n');

async function testGemini() {
    try {
        // Test configuration first
        console.log('1. Testing configuration...');
        const configCheck = validateGeminiConfig();
        console.log('   Configuration:', configCheck.success ? '✅ Valid' : '❌ Invalid');
        console.log('   Message:', configCheck.message);
        
        if (!configCheck.success) {
            console.log('\n❌ Configuration test failed. Please check your .env file.');
            console.log('\n🔧 To fix this:');
            console.log('   1. Get your API key from: https://aistudio.google.com/app/apikey');
            console.log('   2. Update the .env file with your actual API key');
            console.log('   3. Restart the backend server');
            return;
        }
        
        // Test API connection with a simple message
        console.log('\n2. Testing API connection...');
        const testResponse = await generateAIResponse('Hello, this is a test message.');
        
        if (testResponse.success) {
            console.log('   ✅ Gemini API connection successful!');
            console.log('   Response:', testResponse.content.substring(0, 100) + '...');
            console.log('\n🎉 Gemini integration is working correctly!');
            console.log('\n📱 Next steps:');
            console.log('   1. Start your backend: npm run dev');
            console.log('   2. Start your frontend: npm run dev (in chat-frontend)');
            console.log('   3. Test the chat functionality');
        } else {
            console.log('   ❌ API connection failed');
            console.log('   Error:', testResponse.error);
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check your API key at https://aistudio.google.com/app/apikey');
            console.log('   2. Verify the API key is active and has credits');
            console.log('   3. Check your internet connection');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testGemini();

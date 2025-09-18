/**
 * Test OpenRouter Connection
 * 
 * This script tests the OpenRouter API connection to verify everything is working.
 */

import dotenv from 'dotenv';
import { testOpenRouterConnection, validateOpenRouterConfig } from './services/aiService.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing OpenRouter Connection...\n');

async function testConnection() {
    try {
        // Test configuration first
        console.log('1. Testing configuration...');
        const configCheck = validateOpenRouterConfig();
        console.log('   Configuration:', configCheck.success ? '✅ Valid' : '❌ Invalid');
        console.log('   Message:', configCheck.message);
        
        if (!configCheck.success) {
            console.log('\n❌ Configuration test failed. Please check your .env file.');
            return;
        }
        
        // Test API connection
        console.log('\n2. Testing API connection...');
        const connectionTest = await testOpenRouterConnection();
        
        if (connectionTest.success) {
            console.log('   ✅ Connection successful!');
            console.log('   Message:', connectionTest.message);
            console.log('\n🎉 OpenRouter is working correctly!');
            console.log('\n📱 Next steps:');
            console.log('   1. Start your backend: npm run dev');
            console.log('   2. Start your frontend: npm run dev (in chat-frontend)');
            console.log('   3. Test the chat functionality');
        } else {
            console.log('   ❌ Connection failed');
            console.log('   Error:', connectionTest.error);
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check your API key at https://openrouter.ai/keys');
            console.log('   2. Verify the API key is active and has credits');
            console.log('   3. Check your internet connection');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testConnection();

/**
 * Quick OpenRouter Configuration Test
 */

import dotenv from 'dotenv';
import { validateOpenRouterConfig } from './services/aiService.js';

dotenv.config();

console.log('🧪 Testing OpenRouter Configuration...\n');

const configCheck = validateOpenRouterConfig();
console.log('Configuration Check:');
console.log('  Success:', configCheck.success);
console.log('  Message:', configCheck.message);

if (configCheck.success) {
    console.log('\n✅ OpenRouter is properly configured!');
    console.log('🎉 Your chat app should now have AI responses!');
} else {
    console.log('\n❌ Configuration issue:', configCheck.message);
}

console.log('\n📋 API Key Info:');
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('  Length:', apiKey ? apiKey.length : 0);
console.log('  Starts with sk-or-v1:', apiKey ? apiKey.startsWith('sk-or-v1-') : false);
console.log('  Preview:', apiKey ? apiKey.substring(0, 20) + '...' : 'Not set');

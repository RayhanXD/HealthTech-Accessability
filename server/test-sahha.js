/**
 * Simple test script to verify Sahha API integration
 * Run this with: node test-sahha.js
 */

require('dotenv').config();
const sahhaService = require('./services/sahhaService');

async function testSahha() {
  console.log('🧪 Testing Sahha API Integration...\n');
  
  // Check if credentials are set
  if (!process.env.SAHHA_CLIENT_ID || !process.env.SAHHA_SECRET) {
    console.error('❌ Error: Sahha credentials not found!');
    console.log('\nPlease make sure your .env file contains:');
    console.log('  SAHHA_CLIENT_ID=your_client_id');
    console.log('  SAHHA_SECRET=your_secret');
    console.log('\nGet your credentials from: https://app.sahha.ai/credentials\n');
    process.exit(1);
  }

  console.log('✅ Credentials found in .env file');
  console.log(`   Client ID: ${process.env.SAHHA_CLIENT_ID.substring(0, 10)}...`);
  console.log(`   Base URL: ${process.env.SAHHA_BASE_URL || 'https://api.sahha.ai/api/v1'}\n`);

  try {
    console.log('🔐 Testing authentication...');
    const result = await sahhaService.testConnection();
    
    if (result.success) {
      console.log('✅ SUCCESS! Sahha API connection is working!\n');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ FAILED! Sahha API connection failed.\n');
      console.log('Error:', result.message);
      if (result.error) {
        console.log('Details:', JSON.stringify(result.error, null, 2));
      }
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Invalid API credentials');
    console.error('  2. Network connectivity issues');
    console.error('  3. Sahha API endpoint changed');
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testSahha();




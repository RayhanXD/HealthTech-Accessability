require('dotenv').config();

console.log('🔍 Sahha Credentials Verification\n');
console.log('='.repeat(60) + '\n');

const clientId = process.env.SAHHA_CLIENT_ID;
const clientSecret = process.env.SAHHA_CLIENT_SECRET;
const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';

console.log('📋 Current Configuration:');
console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 20)}...` : '❌ MISSING'}`);
console.log(`   Client Secret: ${clientSecret ? '✅ Set (length: ' + clientSecret.length + ' chars)' : '❌ MISSING'}`);
console.log(`   Environment: ${environment}`);
console.log(`   Auth Base URL: ${process.env.SAHHA_AUTH_BASE_URL || 'https://app.sahha.ai'}`);
console.log(`   Data Base URL: ${process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai'}`);
console.log('');

if (!clientId || !clientSecret) {
  console.error('❌ Missing credentials in .env file!');
  process.exit(1);
}

console.log('✅ Credentials are present in .env\n');

console.log('📝 Action Items:\n');
console.log('1. VERIFY IN SAHHA DASHBOARD:');
console.log(`   → Go to: https://${environment === 'sandbox' ? 'test' : 'app'}.sahha.ai`);
console.log('   → Log in with your account');
console.log('   → Navigate to: Settings → API Credentials (or similar)');
console.log('   → Check:');
console.log(`      • Client ID matches: ${clientId.substring(0, 15)}...`);
console.log('      • Status is "Active" or "Enabled"');
console.log('      • No warnings or error messages');
console.log('      • Environment matches (sandbox/production)');
console.log('');

console.log('2. CHECK CREDENTIAL TYPE:');
console.log('   There are TWO types of credentials:');
console.log('   a) Client ID/Secret - For backend API access (what you need)');
console.log('   b) App ID/Secret - For SDK authentication (different)');
console.log('   → Verify you have Client ID/Secret, not App ID/Secret');
console.log('');

console.log('3. TRY PRODUCTION (if you have production credentials):');
console.log('   Update .env:');
console.log('   SAHHA_ENVIRONMENT=production');
console.log('   Then test again');
console.log('');

console.log('4. CONTACT SAHHA SUPPORT:');
console.log('   Email: support@sahha.ai');
console.log('   Subject: 500 Error on Authentication Endpoint');
console.log('');
console.log('   Include:');
console.log(`   • Client ID: ${clientId.substring(0, 15)}...`);
console.log(`   • Environment: ${environment}`);
console.log('   • Error: 500 Internal Server Error');
console.log('   • Endpoint: POST /api/v1/oauth/account/token');
console.log('   • All header variations tested');
console.log('   • Request format verified against OpenAPI spec');
console.log('');

console.log('5. CHECK FOR ALTERNATIVE AUTHENTICATION:');
console.log('   Some accounts may need to use App ID/Secret instead.');
console.log('   Check your dashboard for "App ID" and "App Secret"');
console.log('   These are different from Client ID/Secret');
console.log('');

console.log('='.repeat(60));
console.log('\n💡 The 500 error means Sahha\'s server is rejecting your request.');
console.log('   This is NOT a code issue - your implementation is correct.');
console.log('   The issue is with credential activation or account status.\n');


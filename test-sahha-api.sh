#!/bin/bash
# Quick test script for Sahha API endpoints
# Make sure your server is running first: cd server && npm start

API_URL="${API_URL:-http://localhost:3001}"

echo "🧪 Testing Sahha API Endpoints"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "1️⃣ Checking if server is running..."
if curl -s "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}\n"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "   Start it with: cd server && npm start"
    exit 1
fi

# Test 2: Test authentication endpoint (will fail if credentials not activated)
echo "2️⃣ Testing authentication (via backend service)..."
echo "   This tests if your backend can authenticate with Sahha"
echo ""
cd server
if node -e "
require('dotenv').config();
const sahhaService = require('./services/sahhaService');
(async () => {
  try {
    const token = await sahhaService.getAccountToken();
    console.log('✅ Authentication successful!');
    console.log('   Token:', token.substring(0, 30) + '...');
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    console.log('');
    console.log('💡 This usually means:');
    console.log('   1. Credentials not activated in Sahha Dashboard');
    console.log('   2. Wrong environment (sandbox vs production)');
    console.log('   3. Contact Sahha support to activate API access');
  }
})();
" 2>&1; then
    echo ""
else
    echo -e "${YELLOW}⚠️  Could not test authentication${NC}\n"
fi
cd ..

# Test 3: Show available endpoints
echo "3️⃣ Available Sahha API Endpoints:"
echo ""
echo "   POST $API_URL/api/sahha/sync"
echo "      Body: { playerId, Age, Bodyweight_in_pounds, Height_in_inches, SexAtBirth }"
echo ""
echo "   GET  $API_URL/api/sahha/token/:playerId"
echo "      Returns profile token for SDK"
echo ""
echo "   GET  $API_URL/api/sahha/scores/:sahhaProfileId"
echo "      Returns health scores"
echo ""
echo "   POST $API_URL/api/sahha/test"
echo "      Body: { playerId }"
echo "      Tests integration for a player"
echo ""

echo "📝 To test with a real player:"
echo "   1. Create a player via your signup flow"
echo "   2. Initialize Sahha profile: POST /api/sahha/sync"
echo "   3. Get token: GET /api/sahha/token/:playerId"
echo "   4. Use token in SDK authentication"
echo ""


# Sahha API Testing Guide

This guide will help you test if the Sahha API integration is working correctly.

## 🚀 Quick Test

### Step 1: Start Your Server

```bash
cd server
npm start
# or
npm run dev
```

Make sure the server is running on `http://localhost:3001` (or your configured port).

### Step 2: Run the Complete Test Suite

```bash
cd server
node test-sahha-complete.js
```

This will test:
- ✅ Authentication (with our fixes)
- ✅ Profile creation
- ✅ Token retrieval (new endpoint)
- ✅ Insights fetching
- ✅ Health scores
- ✅ Profile information

## 📋 Individual Test Methods

### Method 1: Test Authentication Only

```bash
cd server
node test-auth.js
```

This tests just the authentication endpoint to verify credentials are working.

### Method 2: Test Full Integration

```bash
cd server
node test-sahha-integration.js
```

This tests the complete flow including profile creation and data fetching.

### Method 3: Test via API Endpoints (Manual)

#### Test 1: Authentication
```bash
curl -X POST http://localhost:3001/api/sahha/test \
  -H "Content-Type: application/json" \
  -d '{"playerId": "YOUR_PLAYER_ID"}'
```

#### Test 2: Create Profile
```bash
curl -X POST http://localhost:3001/api/sahha/sync \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "YOUR_PLAYER_ID",
    "Age": 25,
    "Bodyweight_in_pounds": 165,
    "Height_in_inches": 70,
    "SexAtBirth": "Male"
  }'
```

#### Test 3: Get Profile Token (NEW)
```bash
curl http://localhost:3001/api/sahha/token/YOUR_PLAYER_ID
```

#### Test 4: Get Health Scores
```bash
curl http://localhost:3001/api/sahha/scores/YOUR_SAHHA_PROFILE_ID
```

## 🔍 What to Look For

### ✅ Success Indicators

1. **Authentication**
   - Should see: `✅ Authentication successful!`
   - Should get: Account token (long string)

2. **Profile Creation**
   - Should see: `✅ Sahha profile created`
   - Should get: Profile ID and Profile Token

3. **Token Retrieval**
   - Should see: `✅ Token retrieval successful`
   - Should get: Profile token for SDK

4. **Insights**
   - May be empty initially (normal)
   - Will populate after data collection

### ❌ Common Errors

1. **500 Internal Server Error (Authentication)**
   - **Cause**: Credentials issue or environment mismatch
   - **Fix**: Check `.env` file, verify credentials in Sahha Dashboard

2. **404 Not Found (Profile)**
   - **Cause**: Profile doesn't exist
   - **Fix**: Create profile first using `/api/sahha/sync`

3. **400 Bad Request**
   - **Cause**: Missing required fields
   - **Fix**: Check request body includes all required fields

4. **401 Unauthorized**
   - **Cause**: Invalid or expired token
   - **Fix**: Token should auto-refresh, check authentication

## 🧪 Testing the SDK (Client)

### Prerequisites

1. **Physical Device Required** (SDK doesn't work on simulators)
2. **PlayerId Available** (from test or real user)

### Step 1: Store PlayerId

After running the test suite, you'll get a playerId. Store it:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the playerId from test output
await AsyncStorage.setItem('playerId', 'YOUR_PLAYER_ID_FROM_TEST');
```

### Step 2: Run Client App

```bash
cd client
npm start
# Then press 'i' for iOS or 'a' for Android
```

### Step 3: Navigate to Dashboard

The Sahha SDK will automatically initialize when:
- PlayerId is available
- Dashboard component loads
- User is authenticated

### Step 4: Check Console Logs

Look for these messages:
```
✅ Sahha SDK configured
✅ Sahha authenticated
✅ Sahha enabled for background data collection
✅ Sahha initialized successfully
```

### Step 5: Grant Permissions

When prompted, grant health permissions:
- **iOS**: Health app permissions
- **Android**: Health Connect permissions

## 📊 Verify Data Collection

### Method 1: Check Sahha Dashboard

1. Go to https://test.sahha.ai (sandbox) or https://app.sahha.ai (production)
2. Log in with your credentials
3. Navigate to Profiles
4. Find your test profile by externalId (playerId)
5. Check for data collection status

### Method 2: Check Backend Logs

```bash
# Watch server logs for webhook calls
# You should see:
📥 Webhook received from Sahha
✅ Updated insights for player: {id}
```

### Method 3: Query Insights Endpoint

```bash
curl http://localhost:3001/api/sahha/sync/YOUR_SAHHA_PROFILE_ID
```

## 🐛 Troubleshooting

### Authentication Fails

1. **Check `.env` file**:
   ```env
   SAHHA_CLIENT_ID=your_client_id
   SAHHA_CLIENT_SECRET=your_client_secret
   SAHHA_ENVIRONMENT=sandbox
   ```

2. **Verify in Sahha Dashboard**:
   - Log in to https://test.sahha.ai
   - Check credentials are active
   - Verify environment matches

3. **Try different strategies**:
   - The updated code tries multiple authentication methods
   - Check console logs to see which one works

### Profile Creation Fails

1. **Check player exists**:
   ```bash
   # Verify player in MongoDB
   ```

2. **Check required fields**:
   - Age (18-100)
   - Bodyweight_in_pounds
   - Height_in_inches
   - SexAtBirth (Male/Female/Gender Diverse)

### SDK Not Initializing

1. **Check playerId**:
   ```typescript
   const playerId = await AsyncStorage.getItem('playerId');
   console.log('PlayerId:', playerId);
   ```

2. **Check API URL**:
   ```typescript
   // In useSahha hook
   apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'
   ```

3. **Check network**:
   - Ensure device can reach backend
   - For physical device, use your computer's IP: `http://192.168.x.x:3001`

4. **Check console errors**:
   - Look for error messages in React Native debugger
   - Check Metro bundler logs

## ✅ Success Checklist

- [ ] Authentication works (`test-auth.js` passes)
- [ ] Profile creation works (`test-sahha-integration.js` passes)
- [ ] Token retrieval works (new endpoint returns token)
- [ ] Server is running and accessible
- [ ] PlayerId is stored in AsyncStorage
- [ ] SDK initializes on dashboard load
- [ ] Health permissions are granted
- [ ] Background data collection is enabled
- [ ] Webhooks are received (after data collection)

## 🎯 Next Steps After Testing

1. **Set up webhooks** (for real-time updates)
2. **Configure production environment** (when ready)
3. **Integrate into user signup flow** (auto-initialize profiles)
4. **Add error handling** (user-friendly messages)
5. **Monitor data collection** (check Sahha Dashboard regularly)

## 📞 Need Help?

If tests fail:
1. Check the error messages carefully
2. Verify all environment variables
3. Check Sahha Dashboard for account status
4. Review server logs for detailed errors
5. Contact Sahha support: support@sahha.ai


# Sahha API Setup & Testing Guide

## ✅ Implementation Complete

All code changes have been successfully implemented:

1. ✅ MongoDB connection added to `server.js`
2. ✅ Player and Trainer routes registered
3. ✅ Player model updated with `sahhaProfileId` and `sahhaProfileToken` fields
4. ✅ Sahha controller enhanced to save profile IDs and handle webhooks
5. ✅ Test script created (`test-sahha-integration.js`)
6. ✅ Test endpoint added (`POST /api/sahha/test`)

## 🚀 Quick Start

### 1. Update MongoDB Password

Before running, update your `.env` file with the actual MongoDB password:

```env
MONGODB_URI=mongodb+srv://RayhanM:YOUR_ACTUAL_PASSWORD@convergent.rp9jupu.mongodb.net/?appName=convergent
```

### 2. Start the Server

```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: convergent
🚀 Sahha API Server running on port 3001
```

### 3. Run the Test Script

```bash
cd server
node test-sahha-integration.js
```

This will:
- Test Sahha authentication
- Create a test player
- Create a Sahha profile
- Fetch initial insights
- Test health scores

## 📋 Testing Workflow

### Step 1: Create a Player

```bash
curl -X POST http://localhost:3001/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "testuser",
    "Password": "password123",
    "fName": "John",
    "Lname": "Doe",
    "Age": 25,
    "Bodyweight_in_pounds": 165,
    "Height_in_inches": 70,
    "SexAtBirth": "Male"
  }'
```

Save the `_id` from the response.

### Step 2: Initialize Sahha Profile

```bash
curl -X POST http://localhost:3001/api/sahha/sync \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "YOUR_PLAYER_ID_FROM_STEP_1",
    "Age": 25,
    "Bodyweight_in_pounds": 165,
    "Height_in_inches": 70,
    "SexAtBirth": "Male"
  }'
```

This will:
- Create a Sahha profile
- Save the profile ID to the player
- Fetch initial insights (may be empty)

### Step 3: Test Manual Sync

```bash
curl -X POST http://localhost:3001/api/sahha/test \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "YOUR_PLAYER_ID"
  }'
```

### Step 4: Check Player Data

```bash
curl http://localhost:3001/api/players/YOUR_PLAYER_ID
```

You should see:
- `sahhaProfileId` field populated
- `sahhaProfileToken` field populated
- `Insights` object with Trends and Comparisons

## 🔔 Webhook Setup (For Frequent Updates)

### Option 1: Using ngrok (Local Testing)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com
   ```

2. **Start your server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Register webhook in Sahha Dashboard:**
   - Go to https://app.sahha.ai (or https://test.sahha.ai for sandbox)
   - Navigate to **Webhooks** section
   - Add webhook URL: `https://your-ngrok-url.ngrok.io/api/sahha/webhook`
   - Select data points to receive (Trends, Comparisons, Scores)
   - Save

### Option 2: Production Setup

1. Deploy your server to a public URL
2. Register the webhook URL in Sahha Dashboard
3. Add to `.env`:
   ```env
   WEBHOOK_URL=https://your-production-url.com/api/sahha/webhook
   SAHHA_WEBHOOK_SECRET=your_webhook_secret_if_provided
   ```

## 📊 How Webhooks Work

1. **Sahha collects data** from user devices (via SDK or Demo App)
2. **Sahha processes** the data and generates insights
3. **Sahha sends webhook** to your endpoint with updated profile ID
4. **Your webhook handler**:
   - Receives the webhook
   - Fetches latest insights from Sahha
   - Finds player by `sahhaProfileId`
   - Updates player's `Insights` in database
   - Returns 200 to acknowledge receipt

## 🧪 Testing Webhooks Locally

You can simulate a webhook to test:

```bash
curl -X POST http://localhost:3001/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "insights_updated",
    "profile_id": "YOUR_SAHHA_PROFILE_ID",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

## 📝 API Endpoints Summary

### Sahha Endpoints
- `POST /api/sahha/sync` - Initialize Sahha profile for a player
- `POST /api/sahha/sync/:sahhaProfileId` - Sync insights for existing profile
- `POST /api/sahha/webhook` - Webhook endpoint (called by Sahha)
- `GET /api/sahha/scores/:sahhaProfileId` - Get health scores
- `POST /api/sahha/test` - Test endpoint for manual testing

### Player Endpoints
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Trainer Endpoints
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get single trainer
- `POST /api/trainers` - Create trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

## 🔍 Monitoring & Debugging

### Check Server Logs

The server logs important events:
- `✅ MongoDB connected successfully`
- `✅ Authentication successful!` (Sahha)
- `📥 Webhook received from Sahha`
- `✅ Updated insights for player: {id}`

### Common Issues

1. **MongoDB Connection Failed**
   - Check `.env` file has correct `MONGODB_URI`
   - Verify password is correct
   - Check network connectivity

2. **Sahha Authentication Failed**
   - Verify `SAHHA_CLIENT_ID` and `SAHHA_CLIENT_SECRET` in `.env`
   - Check `SAHHA_ENVIRONMENT` matches your credentials (sandbox/production)
   - Ensure credentials are activated in Sahha Dashboard

3. **No Insights Data**
   - Normal for new profiles (takes 24-48 hours)
   - Use Sahha Demo App to sync test data
   - Check webhook is registered correctly

4. **Webhook Not Receiving Updates**
   - Verify webhook URL is publicly accessible
   - Check ngrok is running (for local testing)
   - Verify webhook is registered in Sahha Dashboard
   - Check server logs for incoming requests

## 🎯 Next Steps

1. **Test the integration** using the test script
2. **Set up webhook** for real-time updates
3. **Use Sahha Demo App** to sync test data
4. **Monitor webhook logs** to see updates coming in
5. **Build frontend** to display health insights
6. **Deploy to production** when ready

## 📚 Resources

- Sahha Documentation: https://docs.sahha.ai
- Sahha Dashboard: https://app.sahha.ai
- Sahha Sandbox Dashboard: https://test.sahha.ai
- API Query Builder: Available in Dashboard

## 💡 Tips

- **Webhooks are recommended** for frequent updates (real-time)
- **REST API polling** can be used as fallback
- **Initial data collection** takes 24-48 hours after profile creation
- **Use Sahha Demo App** for quick testing without SDK integration
- **Monitor logs** to track webhook activity

---

**Ready to test!** Start with `node test-sahha-integration.js` to verify everything works.




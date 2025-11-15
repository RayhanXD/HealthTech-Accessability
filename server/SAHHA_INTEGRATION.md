# Sahha API Integration Guide

This document explains how to integrate and test the Sahha API in your HealthTech application.

## Overview

Sahha provides health, lifestyle, and fitness data analysis through their REST API. This integration allows you to:
- Register player profiles with Sahha
- Fetch health scores, insights, and archetypes
- Sync Sahha data to player insights in your database

## Setup

### 1. Get Your API Credentials

1. Sign up at [Sahha Dashboard](https://app.sahha.ai/)
2. Navigate to the [Credentials page](https://app.sahha.ai/credentials)
3. Copy your **Sandbox Client ID** and **Sandbox Secret** (for testing)
4. For production, use your **Production Client ID** and **Production Secret**

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory with the following:

```env
SAHHA_BASE_URL=https://api.sahha.ai/api/v1
SAHHA_CLIENT_ID=your_sandbox_client_id_here
SAHHA_SECRET=your_sandbox_secret_here
```

### 3. Install Dependencies

```bash
cd server
npm install
```

This will install `axios` which is required for making HTTP requests to the Sahha API.

## API Endpoints

### Test Connection

Test if your Sahha credentials are working:

```bash
GET /api/sahha/test
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully authenticated with Sahha API",
  "data": {
    "success": true,
    "message": "Successfully authenticated with Sahha API",
    "tokenReceived": true
  }
}
```

### Register Player Profile

Register a player with Sahha:

```bash
POST /api/sahha/register/:playerId
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/sahha/register/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Player profile registered with Sahha successfully",
  "data": {
    "playerId": "507f1f77bcf86cd799439011",
    "sahhaProfile": {
      "id": "sahha_profile_id",
      "externalId": "507f1f77bcf86cd799439011",
      ...
    }
  }
}
```

**Note:** Save the `sahhaProfile.id` from the response. You'll need it for subsequent API calls.

### Get Health Scores

Fetch health scores for a player:

```bash
GET /api/sahha/scores/:playerId?startDate=2024-01-01&endDate=2024-01-31&sahhaProfileId=profile_id
```

**Query Parameters:**
- `sahhaProfileId` (optional): The Sahha profile ID if you've stored it
- `startDate` (optional): Start date for data range (ISO format)
- `endDate` (optional): End date for data range (ISO format)

### Get Health Insights

Fetch health insights for a player:

```bash
GET /api/sahha/insights/:playerId?startDate=2024-01-01&endDate=2024-01-31&sahhaProfileId=profile_id
```

### Get Health Archetypes

Fetch health archetypes for a player:

```bash
GET /api/sahha/archetypes/:playerId?sahhaProfileId=profile_id
```

### Sync Sahha Data

Sync all Sahha data (scores, insights, archetypes) to a player's insights:

```bash
POST /api/sahha/sync/:playerId?startDate=2024-01-01&endDate=2024-01-31&sahhaProfileId=profile_id
```

This endpoint:
1. Fetches scores, insights, and archetypes from Sahha
2. Transforms the data to match your Player Insights schema
3. Updates the player's Insights in your database

### Get Sahha Profile

Get the Sahha profile information for a player:

```bash
GET /api/sahha/profile/:playerId?sahhaProfileId=profile_id
```

## Testing the Integration

### Step 1: Test Connection

First, verify your credentials are working:

```bash
curl http://localhost:3001/api/sahha/test
```

If successful, you should see a success message. If not, check your `.env` file.

### Step 2: Create a Test Player

Create a player in your database first:

```bash
POST /api/players
Content-Type: application/json

{
  "Username": "testplayer",
  "Password": "test123",
  "fName": "Test",
  "Lname": "Player",
  "Age": 25,
  "Bodyweight_in_pounds": 180,
  "Height_in_inches": 72,
  "SexAtBirth": "Male"
}
```

### Step 3: Register with Sahha

Register the player with Sahha:

```bash
curl -X POST http://localhost:3001/api/sahha/register/PLAYER_ID_HERE
```

**Important:** Save the `sahhaProfile.id` from the response. You'll need it for other endpoints.

### Step 4: Fetch Data

Now you can fetch various data types:

```bash
# Get scores
curl "http://localhost:3001/api/sahha/scores/PLAYER_ID_HERE?sahhaProfileId=SAHHA_PROFILE_ID"

# Get insights
curl "http://localhost:3001/api/sahha/insights/PLAYER_ID_HERE?sahhaProfileId=SAHHA_PROFILE_ID"

# Get archetypes
curl "http://localhost:3001/api/sahha/archetypes/PLAYER_ID_HERE?sahhaProfileId=SAHHA_PROFILE_ID"

# Sync all data
curl -X POST "http://localhost:3001/api/sahha/sync/PLAYER_ID_HERE?sahhaProfileId=SAHHA_PROFILE_ID"
```

## Data Flow

1. **Registration**: Player is registered with Sahha, receiving a Sahha profile ID
2. **Data Collection**: Sahha collects health data (via SDK, Demo App, or Sample Profiles)
3. **Data Retrieval**: Your app fetches processed data (scores, insights, archetypes) from Sahha
4. **Data Sync**: Data is transformed and stored in your Player's Insights field

## Storing Sahha Profile ID

Currently, the integration uses the player ID as a reference. For production, consider:

1. Adding a `sahhaProfileId` field to your Player model:
```javascript
sahhaProfileId: {
  type: String,
  default: null
}
```

2. Updating the registration endpoint to store the profile ID:
```javascript
player.sahhaProfileId = sahhaProfile.id;
await player.save();
```

3. Using the stored profile ID in subsequent calls instead of passing it as a query parameter.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common errors:
- **401 Unauthorized**: Invalid credentials - check your `SAHHA_CLIENT_ID` and `SAHHA_SECRET`
- **404 Not Found**: Player or Sahha profile not found
- **500 Internal Server Error**: Sahha API error or network issue

## Next Steps

1. **Webhooks**: Consider setting up webhooks for real-time data delivery (recommended by Sahha)
2. **SDK Integration**: Integrate Sahha SDK in your mobile app for live data collection
3. **Sample Profiles**: Use Sahha's sample profiles for testing without real data
4. **Production**: Switch from Sandbox to Production credentials when ready

## Resources

- [Sahha Documentation](https://docs.sahha.ai/)
- [Sahha Dashboard](https://app.sahha.ai/)
- [REST API Guide](https://docs.sahha.ai/docs/data-flow/api)
- [Sahha Slack Community](https://join.slack.com/)

## Support

For issues or questions:
- Check the [Sahha FAQ](https://docs.sahha.ai/)
- Join the [Sahha Slack Community](https://join.slack.com/)
- Contact Sahha support: support@sahha.ai




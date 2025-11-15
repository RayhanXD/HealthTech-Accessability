# Testing Sahha Integration

## Quick Test (Recommended)

Run the test script directly:

```bash
cd server
node test-sahha.js
```

This will:
- ✅ Check if your credentials are in the .env file
- ✅ Test the Sahha API connection
- ✅ Show you the result

## Test via API Endpoint

### 1. Start the Server

Make sure MongoDB is running first:

```bash
# If using Docker:
docker-compose up -d mongodb

# Or start MongoDB locally
```

Then start the server:

```bash
cd server
npm start
```

### 2. Test the Connection Endpoint

In another terminal, run:

```bash
curl http://localhost:3001/api/sahha/test
```

Or use a browser/Postman:
```
GET http://localhost:3001/api/sahha/test
```

### Expected Success Response:

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

### Expected Error Response (if credentials are wrong):

```json
{
  "success": false,
  "message": "Sahha authentication failed: ...",
  "error": "..."
}
```

## Troubleshooting

### Issue: "Sahha credentials not configured"

**Solution:** Make sure your `.env` file in the `server/` directory has:
```env
SAHHA_CLIENT_ID=your_actual_client_id
SAHHA_SECRET=your_actual_secret
```

### Issue: "Sahha authentication failed"

**Possible causes:**
1. Invalid credentials - double-check your Client ID and Secret
2. Using production credentials in sandbox mode (or vice versa)
3. Network connectivity issues

**Solution:** 
- Verify credentials at https://app.sahha.ai/credentials
- Make sure you're using Sandbox credentials for testing

### Issue: Server won't start

**Check:**
1. Is MongoDB running?
2. Are there any errors in the console?
3. Is port 3001 already in use?

**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongo
# or
mongosh --eval "db.adminCommand('ping')"

# Check if port 3001 is in use
lsof -ti:3001
```

## Next Steps After Successful Test

Once the connection test works:

1. **Create a test player:**
   ```bash
   curl -X POST http://localhost:3001/api/players \
     -H "Content-Type: application/json" \
     -d '{
       "Username": "testplayer",
       "Password": "test123",
       "fName": "Test",
       "Lname": "Player",
       "Age": 25,
       "Bodyweight_in_pounds": 180,
       "Height_in_inches": 72,
       "SexAtBirth": "Male"
     }'
   ```

2. **Register the player with Sahha:**
   ```bash
   curl -X POST http://localhost:3001/api/sahha/register/PLAYER_ID_HERE
   ```

3. **Fetch health data:**
   ```bash
   curl http://localhost:3001/api/sahha/scores/PLAYER_ID_HERE
   ```




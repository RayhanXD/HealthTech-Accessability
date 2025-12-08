# Testing Guide: Real Sahha Data Integration

## ✅ Setup Complete

A sample player has been added to your database with real Sahha data:

- **Player Email**: `sample1@test.com`
- **Password**: `test123`
- **Sahha Profile**: `SampleProfile-5a6c7159-139f-4c5f-a578-03cb579bd56c`
- **Trainer**: `convergent@gmail.com` / `test123`

## 🧪 How to Test

### 1. Test Coach Dashboard

1. **Start your server**:
   ```bash
   cd server
   npm start
   ```

2. **Login as trainer**:
   - Email: `convergent@gmail.com`
   - Password: `test123`

3. **View coach dashboard**:
   - You should see "Sample Player 1" in the players list
   - Team statistics (bar chart, pie chart) should show real calculated data
   - Health scores should be from real Sahha data

### 2. Test Athlete Dashboard

1. **Login as player**:
   - Email: `sample1@test.com`
   - Password: `test123`

2. **View athlete dashboard**:
   - Health score should be calculated from real Sahha data
   - All metrics (heart rate, sleep, activity) should be real
   - Progress trend line chart should show real trend data
   - Alerts should be generated from real trend states

### 3. Test API Endpoints Directly

```bash
# Get player health data
curl http://localhost:3001/api/players/PLAYER_ID/health

# Get trainer's players with health data
curl http://localhost:3001/api/trainers/TRAINER_ID/players/health

# Manually sync player data
curl -X POST http://localhost:3001/api/players/PLAYER_ID/sync
```

## 📊 What's Calculated from Real Data

### Coach Dashboard:
- ✅ **Pie Chart** (Healthy/Injured/Suspended) - from player health scores
- ✅ **Bar Chart** (7 metrics) - aggregated from all players' health data
- ✅ **Team Average** - calculated from bar chart metrics
- ✅ **Player List** - real players with real health scores

### Athlete Dashboard:
- ✅ **Health Score** - from wellbeing/readiness scores
- ✅ **Health Metrics** - from trends and comparisons
- ✅ **Alerts** - generated from trend states
- ✅ **Return to Play Status** - calculated from readiness score
- ✅ **Progress Trend Line Chart** - from wellbeing/readiness trend data

## 🔄 Adding More Sample Players

To add another sample profile:

1. **Find a sample profile ID** from Sahha dashboard or use:
   ```bash
   node server/test-sample-profile-complete.js SAMPLE_PROFILE_ID
   ```

2. **Add it to the script**:
   Edit `server/add-sample-players.js` and add the profile ID to `SAMPLE_PROFILES` array

3. **Run the script**:
   ```bash
   node server/add-sample-players.js
   ```

## 🔄 Syncing Data

Data auto-syncs when:
- Fetching player health data (`GET /api/players/:id/health`)
- Fetching trainer players (`GET /api/trainers/:id/players/health`)
- Fetching player by ID (with 5-minute cache)

To manually sync:
```bash
node server/sync-player-data.js sample1@test.com
```

Or use the API:
```bash
curl -X POST http://localhost:3001/api/players/PLAYER_ID/sync
```

## 🐛 Troubleshooting

### No data showing?
- Check if player has `sahhaProfileId` set
- Verify Sahha API credentials in `.env`
- Check server logs for sync errors

### Validation errors?
- Data transformation should handle all Sahha API formats
- If you see errors, check `server/services/sahhaService.js` transform methods

### Empty charts?
- Ensure players have synced insights
- Check that trends/comparisons arrays are not empty
- Verify Sahha profile has data (check Sahha dashboard)

## 📝 Notes

- **No hardcoded data** - Everything is calculated from real Sahha API data
- **Auto-sync** - Data refreshes automatically (5-minute cache)
- **Error handling** - Graceful fallbacks if Sahha API is unavailable
- **Data format** - Backend transforms Sahha data to match frontend structure

---

**Ready to test!** 🚀

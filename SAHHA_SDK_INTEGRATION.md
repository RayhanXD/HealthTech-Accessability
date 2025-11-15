# Sahha SDK Integration - Implementation Summary

## ✅ What Was Implemented

### Backend Changes

1. **New Endpoint: `GET /api/sahha/token/:playerId`**
   - Returns Sahha profile token for SDK authentication
   - Located in: `server/routes/sahhaRoutes.js`
   - Automatically retrieves token from Sahha API if not stored
   - Saves token to player record for future use

### Client Changes

1. **Sahha Integration Files** (in `client/lib/sahha/`)
   - `sahhaConfig.ts` - SDK configuration
   - `sahhaPermissions.ts` - Health permissions handling
   - `sahhaAuth.ts` - Authentication and enabling SDK
   - `useSahha.ts` - React hook for easy integration
   - `README.md` - Usage documentation

2. **Athlete Dashboard Integration**
   - Added Sahha initialization to `client/components/athlete-dashboard-screen.tsx`
   - Automatically initializes when playerId is available

## 🔄 How It Works

### Flow

1. **User logs in/signs up** → Backend returns playerId
2. **Store playerId** → Save to AsyncStorage or state
3. **Component loads** → `useSahha` hook detects playerId
4. **Automatic initialization**:
   - Configures Sahha SDK
   - Fetches profile token from backend (`GET /api/sahha/token/:playerId`)
   - Authenticates SDK with token
   - Requests health permissions from device
   - Enables background data collection

### Backend Flow

```
Client Request → GET /api/sahha/token/:playerId
  ↓
Backend checks if player has Sahha profile
  ↓
If profile exists:
  - Returns stored profile token OR
  - Fetches new token from Sahha API
  - Saves token to player record
  - Returns token to client
```

## 📝 Next Steps

### 1. Store PlayerId After Login/Signup

After successful authentication, store the playerId:

```typescript
// In your sign-in or create-account component
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/api/players/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  const playerId = data.playerId || data._id;
  
  // Store playerId for Sahha initialization
  await AsyncStorage.setItem('playerId', playerId);
  
  // Navigate to dashboard
  router.push('/dashboard');
};
```

### 2. Initialize Sahha Profile After Signup

After creating a new account, initialize the Sahha profile:

```typescript
// After successful account creation
const initializeSahhaProfile = async (playerId: string, userData: any) => {
  await fetch('http://localhost:3001/api/sahha/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      Age: userData.Age,
      Bodyweight_in_pounds: userData.Bodyweight_in_pounds,
      Height_in_inches: userData.Height_in_inches,
      SexAtBirth: userData.SexAtBirth,
    }),
  });
};
```

### 3. Environment Variables

Add to your client `.env` or `app.config.js`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

For production, update to your production API URL.

### 4. Testing

1. **Test on Physical Device** (Sahha SDK doesn't work on simulators)
2. **Complete user signup/login flow**
3. **Check console logs** for Sahha initialization messages
4. **Grant health permissions** when prompted
5. **Verify data collection** in Sahha Dashboard

## 🔍 Debugging

### Check Sahha Initialization

The `useSahha` hook provides status:

```typescript
const { isInitialized, isLoading, error } = useSahha({ playerId });

console.log('Sahha Status:', { isInitialized, isLoading, error });
```

### Common Issues

1. **"PlayerId not found"**
   - Ensure playerId is stored in AsyncStorage after login
   - Check that playerId is passed to `useSahha` hook

2. **"Sahha profile not initialized"**
   - Call `POST /api/sahha/sync` after account creation
   - Ensure player has demographic data (Age, Height, Weight, SexAtBirth)

3. **"Failed to get Sahha token"**
   - Check backend authentication (fix the 500 error we worked on)
   - Verify player has a Sahha profile ID

4. **Permissions not granted**
   - User must grant health permissions on device
   - Check device settings if permissions were denied

## 📚 Files Modified

### Backend
- `server/routes/sahhaRoutes.js` - Added token endpoint

### Client
- `client/lib/sahha/` - New directory with integration files
- `client/components/athlete-dashboard-screen.tsx` - Added Sahha initialization

## 🎯 Integration Points

Sahha is currently integrated in:
- ✅ Athlete Dashboard (`athlete-dashboard-screen.tsx`)

You can add it to other screens as needed:
- Coach Dashboard
- Settings Screen
- Profile Screen

Just import and use the `useSahha` hook:

```typescript
import { useSahha } from '@/lib/sahha/useSahha';

const { isInitialized } = useSahha({ playerId });
```

## ✅ Implementation Complete!

All Sahha SDK integration code is in place. The system will automatically:
- Initialize when playerId is available
- Request health permissions
- Start background data collection
- Sync data with your backend via webhooks

Next: Test on a physical device and ensure playerId is stored after login/signup.


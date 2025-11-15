# Sahha SDK Integration

This directory contains the Sahha SDK integration for the React Native client app.

## Files

- `sahhaConfig.ts` - SDK configuration
- `sahhaPermissions.ts` - Health permissions handling
- `sahhaAuth.ts` - Authentication and enabling SDK
- `useSahha.ts` - React hook for easy integration

## Usage

### Basic Integration

```typescript
import { useSahha } from '@/lib/sahha/useSahha';

function MyComponent() {
  const playerId = 'your-player-id'; // Get from your auth system
  
  const { isInitialized, isLoading, error } = useSahha({
    playerId,
    apiBaseUrl: 'http://localhost:3001',
    autoInitialize: true,
  });

  if (isLoading) {
    return <Text>Initializing Sahha...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (isInitialized) {
    return <Text>Sahha is ready!</Text>;
  }

  return null;
}
```

### Manual Initialization

```typescript
import { useSahha } from '@/lib/sahha/useSahha';

function MyComponent() {
  const { initializeSahha } = useSahha({
    playerId: 'your-player-id',
    autoInitialize: false, // Don't auto-initialize
  });

  const handleInitialize = () => {
    initializeSahha();
  };

  return <Button onPress={handleInitialize}>Initialize Sahha</Button>;
}
```

## Storing PlayerId After Login/Signup

After a user successfully logs in or signs up, store the playerId:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After successful login/signup
const playerId = response.data.playerId; // or response.data._id
await AsyncStorage.setItem('playerId', playerId);
```

## Environment Variables

Add to your `.env` or `app.config.js`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Or in `app.config.js`:

```javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    },
  },
};
```

## Flow

1. User logs in/signs up
2. Backend returns playerId
3. Store playerId in AsyncStorage
4. Component loads playerId
5. `useSahha` hook automatically:
   - Configures SDK
   - Gets profile token from backend
   - Authenticates SDK
   - Requests health permissions
   - Enables background data collection

## Backend Requirements

The backend must have:
- `GET /api/sahha/token/:playerId` - Returns profile token for SDK
- Player must have a Sahha profile initialized (via `POST /api/sahha/sync`)

## Notes

- Sahha SDK only works on physical devices (not simulators)
- Health permissions are required for data collection
- Background data collection starts after `Sahha.enable()` is called


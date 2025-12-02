# Testing Sahha SDK

## Quick Test

You can test if the Sahha SDK is working at minimum by navigating to the test screen:

### Option 1: Navigate in App
Navigate to `/test-sahha` in your app (e.g., add a button that links to it)

### Option 2: Use Console
Add this to any component to test:

```typescript
import { testSahhaSDK } from '@/lib/sahha/testSahhaSDK';

// In a useEffect or button handler:
testSahhaSDK().then((results) => {
  console.log('SDK Test Results:', results);
});
```

## What the Test Checks

1. **SDK Availability** - Is the SDK loaded? (requires native build)
2. **Configuration** - Can the SDK be configured?
3. **Permissions** - Can the SDK request health permissions?

## Expected Results

### ✅ If SDK is Working:
- SDK Available: ✅ Yes
- Configuration: ✅ Working
- Permissions: ✅ Granted (or ⚠️ Not Granted if user denied)

### ❌ If SDK is Not Working:
- SDK Available: ❌ No
- This means:
  - Native build not completed
  - Running in Expo Go (SDK requires development build)
  - Pods not installed

## Next Steps

Once SDK is working:
1. Test authentication (once backend token endpoint is fixed)
2. Test data collection
3. Test fetching insights/scores






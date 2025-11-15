# Sahha API Activation Steps

## Current Issue
Getting 500 errors when trying to authenticate with both Client and Application credentials.

## Possible Activation Steps

### 1. Check Users Section
According to Sahha documentation, you may need to:
- Go to **Users** section in the dashboard (left sidebar under CONFIGURE)
- Add team members or verify your user account is active
- Some accounts require user registration before API access works

### 2. Trial Account Limitations
Your account shows "Trial period active" with 19 days remaining. Trial accounts may have:
- Limited API access
- Need to complete onboarding steps
- Require support activation

### 3. Upgrade to Production
There's an "Upgrade to Production" button visible. However:
- This might not be necessary for sandbox testing
- Sandbox should work without production upgrade
- But if trial has limitations, this might help

### 4. Contact Sahha Support
Since there's no visible "Activate" button:
- Email: support@sahha.ai
- Mention: "Getting 500 Internal Error on `/api/v1/oauth/account/token` in sandbox"
- Ask: "How do I activate API access for my trial account?"
- Include: Your account email and that you're in "Convergent Sandbox"

### 5. Check for Hidden Settings
Look for:
- Settings or Configuration pages
- API Access toggle/switch
- Account Status or Activation status
- Any warnings or notices about API access

## What to Try First

1. **Check Users Section**:
   - Click "Users" in the left sidebar
   - Verify your account is listed and active
   - Add yourself as a user if needed

2. **Look for API Access Settings**:
   - Check if there's a toggle for "API Access" or "Enable API"
   - Look in Settings or Account settings
   - Check for any activation notices

3. **Try the Demo App**:
   - Click "Demo App" in the sidebar
   - This might trigger account activation
   - Or show if there are setup steps needed

4. **Contact Support**:
   - Use the "Book a demo →" button
   - Or email support@sahha.ai directly
   - Mention the 500 errors and ask about activation

## Alternative: SDK-Only Approach

While waiting for API activation, you can:
- Use the SDK directly with Application credentials
- The SDK can create profiles without backend API
- Backend API is mainly for fetching insights/scores later


#!/bin/bash

# Test Sahha SDK at runtime
# This script helps you test the SDK when the app is running

echo "🧪 Sahha SDK Runtime Test Helper"
echo "================================"
echo ""

echo "This script helps you test the SDK when your app is running."
echo ""
echo "📱 Steps to test SDK:"
echo ""
echo "1️⃣  Start your app:"
echo "   cd client && npx expo start --ios"
echo ""
echo "2️⃣  Once app is running, check the console for:"
echo "   ✅ Sahha SDK configured successfully"
echo ""
echo "3️⃣  To test SDK methods, open React Native Debugger:"
echo "   - Press Cmd+D (iOS) or Cmd+M (Android) in simulator"
echo "   - Select 'Debug'"
echo "   - Open Chrome DevTools (http://localhost:8081/debugger-ui)"
echo ""
echo "4️⃣  In the console, test SDK:"
echo ""
echo "   // Test 1: Check if SDK is available"
echo "   const Sahha = require('sahha-react-native').default;"
echo "   console.log('SDK available:', !!Sahha);"
echo ""
echo "   // Test 2: Configure SDK"
echo "   Sahha.configure({ environment: 'sandbox' }, (error, success) => {"
echo "     console.log('Config result:', error || success);"
echo "   });"
echo ""
echo "   // Test 3: Check sensor status"
echo "   const { SahhaSensor, SahhaSensorStatus } = require('sahha-react-native');"
echo "   Sahha.getSensorStatus([SahhaSensor.sleep], (error, status) => {"
echo "     console.log('Sensor status:', error || status);"
echo "   });"
echo ""
echo "5️⃣  Or check Metro bundler logs for SDK messages"
echo ""
echo "💡 Expected logs when SDK works:"
echo "   ✅ Sahha SDK configured successfully"
echo "   ✅ Sahha authenticated (if token provided)"
echo ""





#!/usr/bin/env node

/**
 * Terminal-based test for Sahha SDK setup
 * Run: node test-sdk-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Sahha SDK Setup\n');
console.log('='.repeat(60) + '\n');

let allChecksPassed = true;

// Check 1: SDK package installed
console.log('1️⃣ Checking if sahha-react-native is installed...');
try {
  const packageJson = require('./client/package.json');
  const hasSahha = packageJson.dependencies?.['sahha-react-native'] || 
                   packageJson.devDependencies?.['sahha-react-native'];
  
  if (hasSahha) {
    console.log('   ✅ sahha-react-native package found in package.json');
  } else {
    console.log('   ❌ sahha-react-native not found in package.json');
    console.log('   Run: cd client && npm install sahha-react-native');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('   ❌ Could not read package.json');
  allChecksPassed = false;
}
console.log('');

// Check 2: iOS project exists
console.log('2️⃣ Checking if iOS project exists...');
const iosPath = path.join(__dirname, 'client', 'ios');
if (fs.existsSync(iosPath)) {
  console.log('   ✅ iOS directory exists');
  
  // Check for Podfile
  const podfilePath = path.join(iosPath, 'Podfile');
  if (fs.existsSync(podfilePath)) {
    console.log('   ✅ Podfile exists');
  } else {
    console.log('   ⚠️  Podfile not found (may need to run: npx expo prebuild --platform ios)');
  }
} else {
  console.log('   ❌ iOS directory not found');
  console.log('   Run: cd client && npx expo prebuild --platform ios');
  allChecksPassed = false;
}
console.log('');

// Check 3: Pods installed
console.log('3️⃣ Checking if CocoaPods are installed...');
const podsPath = path.join(iosPath, 'Pods');
if (fs.existsSync(podsPath)) {
  console.log('   ✅ Pods directory exists');
  
  // Check for Sahha pod
  const sahhaPodPath = path.join(podsPath, 'Sahha');
  if (fs.existsSync(sahhaPodPath)) {
    console.log('   ✅ Sahha pod is installed');
  } else {
    console.log('   ⚠️  Sahha pod not found (may need to run: cd client/ios && pod install)');
  }
} else {
  console.log('   ❌ Pods directory not found');
  console.log('   Run: cd client/ios && pod install');
  allChecksPassed = false;
}
console.log('');

// Check 4: SDK configuration file exists
console.log('4️⃣ Checking SDK configuration files...');
const configPath = path.join(__dirname, 'client', 'lib', 'sahha', 'sahhaConfig.ts');
if (fs.existsSync(configPath)) {
  console.log('   ✅ sahhaConfig.ts exists');
} else {
  console.log('   ❌ sahhaConfig.ts not found');
  allChecksPassed = false;
}

const authPath = path.join(__dirname, 'client', 'lib', 'sahha', 'sahhaAuth.ts');
if (fs.existsSync(authPath)) {
  console.log('   ✅ sahhaAuth.ts exists');
} else {
  console.log('   ❌ sahhaAuth.ts not found');
  allChecksPassed = false;
}
console.log('');

// Check 5: app.json configuration
console.log('5️⃣ Checking app.json configuration...');
try {
  const appJson = require('./client/app.json');
  const hasHealthKit = appJson.expo?.ios?.entitlements?.['com.apple.developer.healthkit'];
  const hasUsageDescription = appJson.expo?.ios?.infoPlist?.NSHealthShareUsageDescription;
  
  if (hasHealthKit) {
    console.log('   ✅ HealthKit entitlement configured');
  } else {
    console.log('   ❌ HealthKit entitlement missing');
    allChecksPassed = false;
  }
  
  if (hasUsageDescription) {
    console.log('   ✅ HealthKit usage description configured');
  } else {
    console.log('   ❌ HealthKit usage description missing');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('   ⚠️  Could not read app.json');
}
console.log('');

// Summary
console.log('='.repeat(60));
console.log('📊 Summary\n');

if (allChecksPassed) {
  console.log('✅ All basic checks passed!');
  console.log('\n📱 Next Steps:');
  console.log('   1. Build the iOS app: cd client && npx expo run:ios');
  console.log('   2. Once app is running, check console for SDK logs');
  console.log('   3. Look for: "✅ Sahha SDK configured successfully"');
  console.log('\n💡 To test SDK in app:');
  console.log('   - The SDK will auto-configure on app launch');
  console.log('   - Check the console/logs for SDK status');
  console.log('   - Try requesting permissions in your app');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\n📝 Common fixes:');
  console.log('   • Install SDK: cd client && npm install sahha-react-native');
  console.log('   • Build iOS: cd client && npx expo prebuild --platform ios');
  console.log('   • Install pods: cd client/ios && pod install');
  console.log('   • Build app: cd client && npx expo run:ios');
}

console.log('\n🔍 To see SDK logs in real-time:');
console.log('   npx expo start --ios');
console.log('   (Then check the Metro bundler console for SDK logs)');
console.log('');






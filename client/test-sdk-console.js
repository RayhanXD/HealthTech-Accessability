/**
 * Console test for Sahha SDK
 * This can be run in the React Native debugger console or via a test command
 * 
 * Usage in React Native Debugger:
 * 1. Open React Native Debugger or Chrome DevTools
 * 2. Paste this code in the console
 * 3. Or import and call: import { testSDK } from './test-sdk-console'; testSDK();
 */

// This would need to be run in the React Native context, not Node.js
// For terminal testing, we'll create a different approach

console.log('📝 To test SDK in React Native:');
console.log('   1. Start your app: cd client && npx expo start --ios');
console.log('   2. Open React Native Debugger or Chrome DevTools');
console.log('   3. In the console, run:');
console.log('');
console.log('      import Sahha from "sahha-react-native";');
console.log('      Sahha.configure({ environment: "sandbox" }, (error, success) => {');
console.log('        console.log("SDK Configure:", error || success);');
console.log('      });');
console.log('');





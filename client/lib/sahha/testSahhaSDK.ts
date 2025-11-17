import Sahha from 'sahha-react-native';
import { configureSahha } from './sahhaConfig';
import { requestSahhaPermissions } from './sahhaPermissions';

/**
 * Test Sahha SDK basic functionality
 * This tests SDK availability, configuration, and permissions
 * without requiring backend authentication
 */
export async function testSahhaSDK(): Promise<{
  sdkAvailable: boolean;
  configurationWorking: boolean;
  permissionsWorking: boolean;
  errors: string[];
}> {
  const results = {
    sdkAvailable: false,
    configurationWorking: false,
    permissionsWorking: false,
    errors: [] as string[]
  };

  console.log('🧪 Testing Sahha SDK...\n');

  // Test 1: Check if SDK is available
  console.log('1️⃣ Testing SDK Availability...');
  if (!Sahha) {
    results.errors.push('SDK is not available (Sahha is undefined)');
    console.log('❌ SDK is not available');
    console.log('   This usually means:');
    console.log('   - Native build not completed');
    console.log('   - Running in Expo Go (SDK requires development build)');
    console.log('   - Pods not installed');
    return results;
  }
  results.sdkAvailable = true;
  console.log('✅ SDK is available\n');

  // Test 2: Test SDK Configuration
  console.log('2️⃣ Testing SDK Configuration...');
  try {
    await configureSahha();
    results.configurationWorking = true;
    console.log('✅ SDK configuration successful\n');
  } catch (error: any) {
    results.errors.push(`Configuration failed: ${error.message}`);
    console.log(`❌ SDK configuration failed: ${error.message}\n`);
  }

  // Test 3: Test Permission Request (doesn't require authentication)
  console.log('3️⃣ Testing Permission Request...');
  try {
    const hasPermission = await requestSahhaPermissions();
    results.permissionsWorking = hasPermission;
    if (hasPermission) {
      console.log('✅ Permissions granted\n');
    } else {
      console.log('⚠️ Permissions not granted (user may have denied)\n');
    }
  } catch (error: any) {
    results.errors.push(`Permission request failed: ${error.message}`);
    console.log(`❌ Permission request failed: ${error.message}\n`);
  }

  // Test 4: Check SDK methods
  console.log('4️⃣ Checking SDK Methods...');
  const sahha = Sahha;
  const methods = [
    'configure',
    'authenticateToken',
    'getSensorStatus',
    'enableSensors',
    'disableSensors'
  ];

  const availableMethods: string[] = [];
  const missingMethods: string[] = [];

  methods.forEach((method) => {
    if (typeof sahha[method as keyof typeof sahha] === 'function') {
      availableMethods.push(method);
    } else {
      missingMethods.push(method);
    }
  });

  console.log(`   Available methods: ${availableMethods.join(', ')}`);
  if (missingMethods.length > 0) {
    console.log(`   Missing methods: ${missingMethods.join(', ')}`);
    results.errors.push(`Missing SDK methods: ${missingMethods.join(', ')}`);
  }
  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   SDK Available: ${results.sdkAvailable ? '✅' : '❌'}`);
  console.log(`   Configuration: ${results.configurationWorking ? '✅' : '❌'}`);
  console.log(`   Permissions: ${results.permissionsWorking ? '✅' : '⚠️'}`);
  if (results.errors.length > 0) {
    console.log(`   Errors: ${results.errors.length}`);
    results.errors.forEach((error, index) => {
      console.log(`      ${index + 1}. ${error}`);
    });
  }

  return results;
}

/**
 * Quick test function that can be called from anywhere
 */
export function quickSDKTest() {
  testSahhaSDK()
    .then((results) => {
      if (results.sdkAvailable && results.configurationWorking) {
        console.log('\n✅ SDK is working! Ready for authentication.');
      } else {
        console.log('\n❌ SDK has issues. Check errors above.');
      }
    })
    .catch((error) => {
      console.error('Test failed:', error);
    });
}



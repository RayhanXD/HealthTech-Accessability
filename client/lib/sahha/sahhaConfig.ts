import Sahha from 'sahha-react-native';

let isConfigured = false;
let configurePromise: Promise<void> | null = null;

/**
 * Configure Sahha SDK immediately upon app launch.
 * This function is idempotent - safe to call multiple times.
 * 
 * Environment options:
 * - 'sandbox': For development and testing
 * - 'production': For public release on App Store
 * 
 * Note: SDK will only be available after building the native iOS project.
 * Run: npx expo prebuild --platform ios && cd ios && pod install
 */
export async function configureSahha(): Promise<void> {
  // Check if SDK is available (requires native build)
  if (!Sahha) {
    console.warn('⚠️ Sahha SDK is not available. Make sure you have:');
    console.warn('   1. Built the iOS project: npx expo prebuild --platform ios');
    console.warn('   2. Installed pods: cd ios && pod install');
    console.warn('   3. Running a development build (not Expo Go)');
    // Don't throw error - allow app to continue without SDK
    return Promise.resolve();
  }

  // If already configured, return the existing promise
  if (isConfigured && configurePromise) {
    return configurePromise;
  }

  // If configuration is in progress, return the existing promise
  if (configurePromise) {
    return configurePromise;
  }

  const sahha = Sahha; // Type narrowing

  configurePromise = new Promise<void>((resolve, reject) => {
    sahha.configure(
      {
        environment: 'sandbox', // Change to 'production' when ready for App Store release
      },
      (error: string, success: boolean) => {
        if (error || !success) {
          console.error('❌ Error configuring Sahha:', error);
          configurePromise = null; // Reset on error so it can be retried
          reject(new Error(error || 'Failed to configure Sahha'));
        } else {
          console.log('✅ Sahha SDK configured successfully');
          isConfigured = true;
          resolve();
        }
      }
    );
  });

  return configurePromise;
}

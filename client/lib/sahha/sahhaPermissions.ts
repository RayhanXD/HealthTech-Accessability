import Sahha from 'sahha-react-native';

export async function requestSahhaPermissions(): Promise<boolean> {
  if (!Sahha) {
    console.error('❌ Sahha SDK is not available');
    return false;
  }

  const sahha = Sahha; // Type narrowing
  const { SahhaSensor, SahhaSensorStatus } = require('sahha-react-native');
  const sensors = [
    SahhaSensor.sleep,
    SahhaSensor.steps,
    SahhaSensor.heart_rate,
    SahhaSensor.active_energy_burned,
  ];

  return new Promise<boolean>((resolve) => {
    // Check current status
    sahha.getSensorStatus(sensors, (error: string, status: number) => {
      if (error) {
        console.error('❌ Error getting sensor status:', error);
        resolve(false);
        return;
      }

      console.log('Sahha permission status:', status);

      // If already enabled, return true
      if (status === SahhaSensorStatus.enabled) {
        resolve(true);
        return;
      }

      // If pending or disabled, try to enable
      if (status === SahhaSensorStatus.pending || status === SahhaSensorStatus.disabled) {
        sahha.enableSensors(sensors, (enableError: string, enableStatus: number) => {
          if (enableError) {
            console.error('❌ Error requesting Sahha permissions:', enableError);
            resolve(false);
          } else {
            const isAuthorized = enableStatus === SahhaSensorStatus.enabled;
            console.log('Sahha permission request result:', isAuthorized ? 'authorized' : 'not authorized');
            resolve(isAuthorized);
          }
        });
      } else {
        // Unavailable
        console.warn('⚠️ Sahha sensors are unavailable on this device');
        resolve(false);
      }
    });
  });
}

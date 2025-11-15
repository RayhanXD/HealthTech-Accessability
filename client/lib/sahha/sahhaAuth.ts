import Sahha from 'sahha-react-native';

export async function authenticateSahha(token: string): Promise<boolean> {
  if (!Sahha) {
    throw new Error('Sahha SDK is not available');
  }

  const sahha = Sahha; // Type narrowing

  return new Promise<boolean>((resolve, reject) => {
    // authenticateToken takes profileToken and refreshToken (can be empty string)
    sahha.authenticateToken(
      token,
      '', // refreshToken - empty for now, can be stored and used later
      (error: string, success: boolean) => {
        if (error || !success) {
          console.error('❌ Error authenticating Sahha:', error);
          reject(new Error(error || 'Failed to authenticate Sahha'));
        } else {
          console.log('✅ Sahha authenticated');
          resolve(true);
        }
      }
    );
  });
}

export async function enableSahha(): Promise<void> {
  if (!Sahha) {
    throw new Error('Sahha SDK is not available');
  }

  const sahha = Sahha; // Type narrowing

  // Enable common sensors for data collection
  const { SahhaSensor } = require('sahha-react-native');
  const sensors = [
    SahhaSensor.sleep,
    SahhaSensor.steps,
    SahhaSensor.heart_rate,
    SahhaSensor.active_energy_burned,
  ];

  return new Promise<void>((resolve, reject) => {
    sahha.enableSensors(sensors, (error: string, status: number) => {
      if (error) {
        console.error('❌ Error enabling Sahha sensors:', error);
        reject(new Error(error));
      } else {
        console.log('✅ Sahha sensors enabled for background data collection');
        resolve();
      }
    });
  });
}

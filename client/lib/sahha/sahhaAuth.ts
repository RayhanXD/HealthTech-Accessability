import Sahha from 'sahha-react-native';

/**
 * Authenticate Sahha SDK with a token from backend
 * @param token - User token from backend API
 */
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

/**
 * Authenticate Sahha SDK directly with Application credentials (alternative method)
 * This bypasses the backend token creation if the /v1/user/token endpoint doesn't work
 * @param appId - Application ID from Sahha Dashboard
 * @param appSecret - Application Secret from Sahha Dashboard
 * @param externalId - User's external ID (playerId)
 */
export async function authenticateSahhaDirect(
  appId: string,
  appSecret: string,
  externalId: string
): Promise<boolean> {
  if (!Sahha) {
    throw new Error('Sahha SDK is not available');
  }

  const sahha = Sahha; // Type narrowing

  return new Promise<boolean>((resolve, reject) => {
    // Try authenticate method with appId/appSecret/externalId (if SDK supports it)
    if (sahha.authenticate) {
      sahha.authenticate(
        {
          appId: appId,
          appSecret: appSecret,
          externalId: externalId
        },
        (error: string, success: boolean) => {
          if (error || !success) {
            console.error('❌ Error authenticating Sahha directly:', error);
            reject(new Error(error || 'Failed to authenticate Sahha'));
          } else {
            console.log('✅ Sahha authenticated directly');
            resolve(true);
          }
        }
      );
    } else {
      reject(new Error('SDK does not support direct authentication. Use token method instead.'));
    }
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

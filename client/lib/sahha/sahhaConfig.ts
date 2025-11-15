import Sahha from 'sahha-react-native';

export async function configureSahha() {
  if (!Sahha) {
    throw new Error('Sahha SDK is not available');
  }

  const sahha = Sahha; // Type narrowing

  return new Promise<void>((resolve, reject) => {
    sahha.configure(
      {
        environment: 'sandbox', // Change to 'production' when ready
        theme: 'light',
      },
      (error: string, success: boolean) => {
        if (error || !success) {
          console.error('❌ Error configuring Sahha:', error);
          reject(new Error(error || 'Failed to configure Sahha'));
        } else {
          console.log('✅ Sahha SDK configured');
          resolve();
        }
      }
    );
  });
}

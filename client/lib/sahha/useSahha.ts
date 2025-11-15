import { useEffect, useState } from 'react';
import { configureSahha } from './sahhaConfig';
import { authenticateSahha, enableSahha } from './sahhaAuth';
import { requestSahhaPermissions } from './sahhaPermissions';

interface UseSahhaOptions {
  playerId?: string;
  apiBaseUrl?: string;
  autoInitialize?: boolean;
}

export function useSahha(options: UseSahhaOptions = {}) {
  const { 
    playerId, 
    apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001', 
    autoInitialize = true 
  } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializeSahha = async () => {
    if (!playerId) {
      console.warn('⚠️ Cannot initialize Sahha: playerId is required');
      setError(new Error('playerId is required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Configure SDK
      await configureSahha();

      // Step 2: Get profile token from backend
      const tokenResponse = await fetch(`${apiBaseUrl}/api/sahha/token/${playerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        
        // If profile doesn't exist, return error with action
        if (tokenResponse.status === 400 && errorData.action === 'initialize_profile') {
          throw new Error('Sahha profile not initialized. Please complete profile setup first.');
        }
        
        throw new Error(errorData.message || 'Failed to get Sahha token');
      }

      const { token } = await tokenResponse.json();

      if (!token) {
        throw new Error('No token received from backend');
      }

      // Step 3: Authenticate Sahha
      await authenticateSahha(token);

      // Step 4: Request permissions
      const hasPermission = await requestSahhaPermissions();

      if (hasPermission) {
        // Step 5: Enable background data collection
        await enableSahha();
        setIsInitialized(true);
        console.log('✅ Sahha initialized successfully');
      } else {
        console.warn('⚠️ Sahha permissions not granted');
        setError(new Error('Sahha permissions not granted'));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('❌ Error initializing Sahha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoInitialize && playerId) {
      initializeSahha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, autoInitialize]);

  return {
    isInitialized,
    isLoading,
    error,
    initializeSahha,
  };
}


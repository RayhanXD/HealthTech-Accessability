import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For iOS simulator, use localhost. For Android emulator, use 10.0.2.2
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // iOS simulator can use localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:3001';
  }
  
  // Android emulator uses 10.0.2.2 to reach host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }
  
  // Default fallback
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
console.log('🔗 API Base URL:', API_BASE_URL);

// Token management
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// API request helper
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if response has content before trying to parse JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `Server returned ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    // Handle network errors
    if (error.message === 'Network request failed' || error.message.includes('Failed to fetch')) {
      throw new Error(
        `Cannot connect to server at ${API_BASE_URL}. ` +
        `Make sure the server is running and accessible. ` +
        `If using a simulator, try using your computer's IP address instead of localhost.`
      );
    }
    // Re-throw other errors
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register player (athlete)
  registerPlayer: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    age?: number;
    bodyweight_in_pounds?: number;
    height_in_inches?: number;
    sex_at_birth?: string;
  }) => {
    const response = await apiRequest('/api/auth/register/player', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      await setToken(response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Register trainer (coach)
  registerTrainer: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await apiRequest('/api/auth/register/trainer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      await setToken(response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Login
  login: async (data: {
    email: string;
    password: string;
    role: 'player' | 'trainer';
  }) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      await setToken(response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiRequest('/api/auth/me', {
      method: 'GET',
    });
  },

  // Logout
  logout: async () => {
    await removeToken();
    await AsyncStorage.removeItem('userData');
  },
};

// Export token management functions
export { getToken, setToken, removeToken };


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Easing } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { configureSahha } from '@/lib/sahha/sahhaConfig';

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Removed anchor to allow root index.tsx to be the first screen
};

// Custom smooth transition configuration optimized for 120Hz displays
// Reduced durations and optimized easing for higher frame rates
const smoothTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 250, // Reduced for snappier feel at 120Hz
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Optimized bezier for 120Hz
        useNativeDriver: true,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200, // Reduced for snappier feel at 120Hz
        easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Optimized bezier for 120Hz
        useNativeDriver: true,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.98], // Slightly less scale for smoother 120Hz
                })
              : 1,
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.25, 0.75, 1], // More granular steps for 120Hz
          outputRange: [0, 0.6, 0.9, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
      },
    };
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  // Configure Sahha SDK immediately upon app launch
  useEffect(() => {
    configureSahha().catch((error) => {
      console.error('Failed to configure Sahha SDK at app launch:', error);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          ...smoothTransition,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="gender-selection" />
        <Stack.Screen name="next" />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="add-coach" />
        <Stack.Screen name="congratulations" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="coach-dashboard" />
        <Stack.Screen name="test-sahha" />
        <Stack.Screen name="terms-and-conditions" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="about" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
            animation: 'slide_from_bottom',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

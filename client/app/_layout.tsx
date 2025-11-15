import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Easing } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Removed anchor to allow root index.tsx to be the first screen
};

// Custom smooth transition configuration with optimized timing
const smoothTransition = {
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 250,
        easing: Easing.in(Easing.cubic),
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
                  outputRange: [1, 0.97],
                })
              : 1,
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 0.5, 0.85, 1],
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          ...smoothTransition,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'default',
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

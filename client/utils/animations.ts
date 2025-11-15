/**
 * Reusable Animation Utilities
 * Provides common animation configurations for use across components
 */

import { Animated } from 'react-native';
import { Animations } from '@/constants/theme';

/**
 * Fade in animation
 */
export const fadeIn = (value: Animated.Value, duration = Animations.duration.normal) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (value: Animated.Value, duration = Animations.duration.normal) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Slide up animation
 */
export const slideUp = (
  value: Animated.Value,
  distance = 20,
  duration = Animations.duration.normal
) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Scale animation
 */
export const scale = (
  value: Animated.Value,
  toValue = 1,
  duration = Animations.duration.normal
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Combined fade and slide animation
 */
export const fadeSlideUp = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  distance = 20,
  duration = Animations.duration.normal
) => {
  return Animated.parallel([
    fadeIn(fadeValue, duration),
    slideUp(slideValue, distance, duration),
  ]);
};

/**
 * Pulse animation (for loading states)
 */
export const pulse = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ])
  );
};


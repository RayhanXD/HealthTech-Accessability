import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface WelcomeScreenProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function WelcomeScreen({
  onSignUp,
  onSignIn,
}: WelcomeScreenProps) {
  const router = useRouter();
  const { height: screenHeight } = Dimensions.get('window');

  // Animation values - simplified
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const signInOpacity = useSharedValue(0);

  // Button press animations
  const signUpButtonScale = useSharedValue(1);

  useEffect(() => {
    // Optimized fade-in animations for 120Hz displays
    // Using bezier easing for smoother high-frame-rate animations
    titleOpacity.value = withTiming(1, { 
      duration: 400, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) // Optimized for 120Hz
    });
    
    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { 
        duration: 350, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
    }, 150);

    setTimeout(() => {
      signInOpacity.value = withTiming(1, { 
        duration: 350,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    }, 250);
  }, []);

  const handleSignUp = () => {
    // Optimized spring animations for 120Hz - higher damping and stiffness for smoother feel
    signUpButtonScale.value = withSequence(
      withSpring(0.96, { 
        damping: 15, // Increased for smoother 120Hz
        stiffness: 400, // Increased for snappier response
        mass: 0.5 // Lower mass for faster response
      }),
      withSpring(1, { 
        damping: 15, 
        stiffness: 400,
        mass: 0.5
      })
    );
    
    setTimeout(() => {
      if (onSignUp) {
        onSignUp();
      } else {
        router.push('/gender-selection' as any);
      }
    }, 150);
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      router.push('/sign-in' as any);
    }
  };

  // Animated styles - simplified
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: signUpButtonScale.value }],
  }));

  const signInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: signInOpacity.value,
  }));


  // Calculate status bar height dynamically
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12
    : (StatusBar.currentHeight || 0) + 12;

  return (
    <View style={styles.container}>
      {/* Dynamic top spacing to prevent status bar overlap */}
      <View style={{ height: statusBarHeight }} />

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>
            Welcome to{' '}
            <Text style={styles.titleHighlight}>Syntra</Text>
          </Text>
          <Text style={styles.titleSubtitle}>The <Text style={styles.titleSubtitleHighlight}>ultimate</Text> training platform for athletes</Text>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsSection}>
        <AnimatedTouchableOpacity
          style={[styles.signUpButton, buttonAnimatedStyle]}
          onPress={handleSignUp}
          activeOpacity={0.9}>
          <Text style={styles.signUpButtonText}>Get Started</Text>
        </AnimatedTouchableOpacity>

        <Animated.View style={[styles.signInContainer, signInAnimatedStyle]}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.7}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['4xl'],
  },
  title: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: BrandColors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titleHighlight: {
    color: BrandColors.purple,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.medium,
  },
  titleSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    paddingTop: Spacing.md,
    fontFamily: Typography.fontFamily.medium,
    color: SemanticColors.textSecondary,
    textAlign: 'center',
  },
  titleSubtitleHighlight: {
    color: BrandColors.purple,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.medium,
  },
  actionButtonsSection: {
    paddingHorizontal: Spacing['4xl'],
    paddingBottom: Spacing['4xl'] + 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  signUpButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  signUpButtonText: {
    color: BrandColors.white,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  signInText: {
    color: SemanticColors.textSecondary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.sans,
    letterSpacing: 0.2,
  },
  signInLink: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
  },
});
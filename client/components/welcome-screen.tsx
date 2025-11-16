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
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BrandColors, SemanticColors, Spacing, Typography, FuturisticDesign, BorderRadius } from '@/constants/theme';

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

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  const signInOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);

  // Button press animations
  const signUpButtonScale = useSharedValue(1);

  useEffect(() => {
    // Entrance animations sequence
    titleOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    titleTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      subtitleTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 200);

    setTimeout(() => {
      buttonOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      buttonScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    }, 400);

    setTimeout(() => {
      signInOpacity.value = withTiming(1, { duration: 500 });
    }, 600);

    // Glow pulse animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Floating particles animation
    particle1Y.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    particle2Y.value = withRepeat(
      withSequence(
        withTiming(-25, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    particle3Y.value = withRepeat(
      withSequence(
        withTiming(-35, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

  }, []);

  const handleSignUp = () => {
    signUpButtonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
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

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value * signUpButtonScale.value }],
  }));

  const signInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: signInOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle2Y.value }],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle3Y.value }],
  }));


  // Calculate status bar height dynamically
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12
    : (StatusBar.currentHeight || 0) + 12;

  return (
    <View style={styles.container}>
      {/* Dynamic top spacing to prevent status bar overlap */}
      <View style={{ height: statusBarHeight }} />
      
      {/* Animated gradient background using Views */}
      <View style={styles.gradientBackground}>
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
      </View>

      {/* Minimal decorative particles - reduced for cleaner look */}
      <Animated.View style={[styles.particle, styles.particle1, particle1Style]}>
        <View style={[styles.particleDot, { backgroundColor: BrandColors.purple }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.particle2, particle2Style]}>
        <View style={[styles.particleDot, { backgroundColor: BrandColors.purple }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, styles.particle3, particle3Style]}>
        <View style={[styles.particleDot, { backgroundColor: BrandColors.green }]} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Subtle glow effect behind title - more minimalistic */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <View style={styles.glowCircle} />
        </Animated.View>

        <Animated.View style={titleAnimatedStyle}>
          <Text style={styles.title}>
            Welcome to{'\n'}
            <Text style={styles.titleHighlight}>Syntra</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, subtitleAnimatedStyle]}>
          <Text style={styles.subtitle}>
            Your journey to peak performance{'\n'}
            starts here
          </Text>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsSection}>
        <AnimatedTouchableOpacity
          style={[styles.signUpButton, buttonAnimatedStyle]}
          onPress={handleSignUp}
          activeOpacity={0.9}>
          <View style={styles.signUpButtonGradient}>
            <Text style={styles.signUpButtonText}>Get Started</Text>
          </View>
          <View style={styles.signUpButtonShadow} />
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
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BrandColors.black,
  },
  gradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    opacity: 0.6,
  },
  gradientLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a0a1a',
    opacity: 0.3,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['4xl'],
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: BrandColors.purple,
    opacity: 0.08,
  },
  title: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: BrandColors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  titleHighlight: {
    color: BrandColors.purple,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  subtitleContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Typography.fontFamily.sans,
    color: SemanticColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
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
    marginBottom: Spacing['2xl'],
    overflow: 'visible',
  },
  signUpButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...FuturisticDesign.glow,
  },
  signUpButtonShadow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    opacity: 0.2,
    top: 2,
    zIndex: -1,
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
  particle: {
    position: 'absolute',
    opacity: 0.25,
  },
  particleDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  particle1: {
    top: '25%',
    left: '20%',
  },
  particle2: {
    top: '40%',
    right: '25%',
  },
  particle3: {
    top: '55%',
    left: '15%',
  },
});
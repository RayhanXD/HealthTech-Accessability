import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, FuturisticDesign, BorderRadius, ComponentTokens } from '@/constants/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SignInScreenProps {
  onLogin?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  continueHref?: string;
}

export default function SignInScreen({
  onLogin,
  onForgotPassword,
  continueHref = '/dashboard',
}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    titleTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    setTimeout(() => {
      formOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      formTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    }, 200);
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return isValidEmail(email) && password.length > 0;
  };

  const handleLogin = async () => {
    if (!isFormValid()) return;
    
    if (onLogin) {
      onLogin(email, password);
    } else {
      // Check user role and navigate to appropriate dashboard
      try {
        const userRole = await AsyncStorage.getItem('userRole');
        if (userRole === 'coach') {
          router.push('/coach-dashboard' as any);
        } else {
          router.push('/dashboard' as any);
        }
      } catch (error) {
        // If role not found, default to athlete dashboard
        router.push('/dashboard' as any);
      }
    }
  };

  const handleBack = () => {
    router.push('/' as any);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      router.push('/forgot-password' as any);
    }
  };

  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height dynamically
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12
    : (StatusBar.currentHeight || 0) + 12;

  return (
    <View style={styles.container}>
      {/* Dynamic top spacing to prevent status bar overlap */}
      <View style={{ height: statusBarHeight }} />
      
      {/* Back Button & Full Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width={34} height={37} viewBox="0 0 34 37" fill="none">
              <Path
                d="M21 12L13 18.5L21 25"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View style={styles.progressBarFill} />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.titleSection, useAnimatedStyle(() => ({
          opacity: titleOpacity.value,
          transform: [{ translateY: titleTranslateY.value }],
        }))]}>
          <Text style={styles.title}>Sign in</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, useAnimatedStyle(() => ({
          opacity: formOpacity.value,
          transform: [{ translateY: formTranslateY.value }],
        }))]}>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={SemanticColors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.passwordFieldContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="enter your password"
              placeholderTextColor={SemanticColors.textTertiary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}>
            <View style={styles.checkbox}>
              {rememberMe && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View style={styles.loginButtonContainer}>
          <AnimatedTouchableOpacity
            style={[
              styles.loginButton,
              !isFormValid() && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={!isFormValid()}>
            <Text
              style={[
                styles.loginButtonText,
                !isFormValid() && styles.loginButtonTextDisabled,
              ]}>
              Sign in
            </Text>
          </AnimatedTouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an Account? </Text>
          <Link href="/create-account" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background,
  },
  progressSection: {
    paddingHorizontal: 18,
    marginTop: 0,
    marginBottom: Spacing['3xl'],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    position: 'relative',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SemanticColors.borderSecondary,
    borderRadius: 3,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    backgroundColor: SemanticColors.success,
    borderRadius: 3,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Spacing['4xl'],
    paddingTop: Spacing['4xl'],
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  titleSection: {
    marginBottom: Spacing['4xl'],
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  fieldContainer: {
    marginBottom: Spacing['2xl'],
    width: '100%',
  },
  passwordFieldContainer: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  label: {
    color: SemanticColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  inputContainer: {
    ...ComponentTokens.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: BrandColors.white,
    fontSize: 16,
    fontFamily: Typography.fontFamily.sans,
    padding: 0,
  },
  eyeButton: {
    paddingLeft: Spacing.md,
  },
  eyeButtonText: {
    color: BrandColors.purple,
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['6xl'],
    width: '100%',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: SemanticColors.borderMuted,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: BrandColors.purple,
  },
  rememberMeText: {
    color: SemanticColors.textSecondary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  forgotPasswordText: {
    color: BrandColors.purple,
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
  },
  loginButtonContainer: {
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...FuturisticDesign.glow,
  },
  loginButtonDisabled: {
    backgroundColor: SemanticColors.surfaceSecondary,
    opacity: 0.4,
  },
  loginButtonText: {
    color: BrandColors.white,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  loginButtonTextDisabled: {
    color: SemanticColors.textTertiary,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  signUpText: {
    color: SemanticColors.textSecondary,
    fontSize: 14,
    fontFamily: Typography.fontFamily.sans,
    letterSpacing: 0.2,
  },
  signUpLink: {
    color: BrandColors.white,
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: '600',
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
  },
  });

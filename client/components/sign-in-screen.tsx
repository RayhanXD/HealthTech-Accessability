import React, { useState } from 'react';
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
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, SyntraColors } from '@/constants/theme';

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
    router.back();
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
        <View style={styles.titleSection}>
          <Text style={styles.title}>Sign in</Text>
          <Svg width={74} height={3} viewBox="0 0 77 3" fill="none">
            <Path
              d="M1.5 1.5H75.5"
              stroke={SyntraColors.purple}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <Image
                source={{
                  uri: 'https://api.builder.io/api/v1/image/assets/TEMP/0805bfd236c0d50fab5cc8d2663b7738f8dd8883?width=32',
                }}
                style={styles.inputIcon}
                contentFit="contain"
              />
              <Svg width={1} height={9} viewBox="0 0 1 9" fill="none">
                <Path
                  d="M0.5 8.5L0.5 0.5"
                  stroke="white"
                  strokeLinecap="round"
                />
              </Svg>
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
            <Svg width="100%" height={2} viewBox="0 0 345 2" fill="none">
              <Path
                d="M0.75 0.75H343.75"
                stroke={SyntraColors.purple}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.passwordFieldContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.passwordInputRow}>
              <View style={styles.inputRow}>
                <Image
                  source={{
                    uri: 'https://api.builder.io/api/v1/image/assets/TEMP/3a4e4b50aeba2df667be1d3998be13220e159ebd?width=32',
                  }}
                  style={styles.inputIcon}
                  contentFit="contain"
                />
                <Svg width={1} height={9} viewBox="0 0 1 9" fill="none">
                  <Path
                    d="M0.5 8.5L0.5 0.5"
                    stroke="white"
                    strokeLinecap="round"
                  />
                </Svg>
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
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <Image
                  source={{
                    uri: 'https://api.builder.io/api/v1/image/assets/TEMP/7c836a3c9c4fc8a304ae4a87211607a3c9d5ef59?width=32',
                  }}
                  style={styles.inputIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
            <Svg width="100%" height={2} viewBox="0 0 345 2" fill="none">
              <Path
                d="M0.75 0.75H343.75"
                stroke={SyntraColors.purple}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
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
          <TouchableOpacity
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
              Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an Account ?</Text>
          <Link href="/" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
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
    paddingHorizontal: 17,
    marginTop: 0,
    marginBottom: 48,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: SemanticColors.background,
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
    paddingHorizontal: 24,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 38,
    lineHeight: 41.8,
    fontWeight: '500',
    color: SemanticColors.textPrimary,
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 32,
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
  },
  passwordFieldContainer: {
    marginBottom: 16,
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    color: SemanticColors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.2,
    lineHeight: 22.4,
  },
  inputWrapper: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputIcon: {
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: SemanticColors.textPrimary,
    fontSize: 14,
  },
  eyeButton: {
    marginLeft: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: SemanticColors.primaryDark,
    backgroundColor: SemanticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: SemanticColors.primaryDark,
    backgroundColor: SemanticColors.primary,
  },
  rememberMeText: {
    color: SemanticColors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  forgotPasswordText: {
    color: SemanticColors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loginButtonContainer: {
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 24,
  },
  loginButton: {
    width: '100%',
    height: 49,
    borderRadius: 12,
    backgroundColor: SemanticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  loginButtonDisabled: {
    backgroundColor: SemanticColors.surfaceSecondary,
    opacity: 0.5,
  },
  loginButtonText: {
    color: SemanticColors.textOnPrimary,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25.2,
  },
  loginButtonTextDisabled: {
    color: SemanticColors.textTertiary,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
  },
  signUpText: {
    color: SemanticColors.textPrimary,
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 19.6,
  },
  signUpLink: {
    color: SemanticColors.primary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 19.6,
  },
  });

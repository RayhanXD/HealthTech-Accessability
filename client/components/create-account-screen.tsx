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
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';

interface CreateAccountScreenProps {
  onCreateAccount?: (email: string, password: string) => void;
  continueHref?: string;
}

export default function CreateAccountScreen({
  onCreateAccount,
  continueHref = '/add-coach',
}: CreateAccountScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length < 10) return 2;
    return 3;
  };

  const passwordStrength = getPasswordStrength(password);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      isValidEmail(email) &&
      passwordStrength >= 3 &&
      password === confirmPassword &&
      password.length > 0 &&
      confirmPassword.length > 0
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateAccount = () => {
    if (!isFormValid()) return;
    
    if (onCreateAccount) {
      onCreateAccount(email, password);
    } else {
      router.push('/add-coach' as any);
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
      
      {/* Back Button & Progress Bar */}
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
            <AnimatedProgressBar
              width={155}
              backgroundColor={SemanticColors.success}
              backgroundBarColor={SemanticColors.borderSecondary}
              borderRadius={3}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create an account</Text>
          <Svg width={74} height={3} viewBox="0 0 77 3" fill="none">
            <Path
              d="M1.5 1.5H75.5"
              stroke={BrandColors.purple}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Email Field */}
        <View style={[styles.fieldContainer, { marginBottom: 32 }]}>
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
                stroke={BrandColors.purple}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Password Field */}
        <View style={[styles.fieldContainer, { marginBottom: 12 }]}>
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
                stroke="#BDBDBD"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Password Strength Indicator */}
        <View style={[styles.passwordStrengthContainer, { marginBottom: 32 }]}>
          <View style={styles.strengthBars}>
            <View
              style={[
                styles.strengthBar,
                styles.strengthBar1,
                passwordStrength >= 1 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                styles.strengthBar2,
                passwordStrength >= 2 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                styles.strengthBar3,
                passwordStrength >= 3 && styles.strengthBarActive,
              ]}
            />
          </View>
          {passwordStrength >= 3 && (
            <Text style={styles.strongPasswordText}>Strong Password</Text>
          )}
        </View>

        {/* Confirm Password Field */}
        <View style={[styles.fieldContainer, { marginBottom: 48 }]}>
          <Text style={styles.label}>Confirm Password</Text>
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="enter your password"
                  placeholderTextColor={SemanticColors.textTertiary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                stroke="#BDBDBD"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            !isFormValid() && styles.createButtonDisabled,
          ]}
          onPress={handleCreateAccount}
          activeOpacity={0.9}
          disabled={!isFormValid()}>
          <Text
            style={[
              styles.createButtonText,
              !isFormValid() && styles.createButtonTextDisabled,
            ]}>
            Create Account
          </Text>
        </TouchableOpacity>
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
    backgroundColor: BrandColors.black,
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
  },
  fieldContainerSmall: {
    marginBottom: 12,
  },
  fieldContainerLarge: {
    marginBottom: 48,
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
  passwordStrengthContainer: {
    marginBottom: 32,
  },
  strengthBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  strengthBar: {
    height: 3,
    borderRadius: 5,
    backgroundColor: '#374151',
  },
  strengthBar1: {
    width: 105,
  },
  strengthBar2: {
    width: 105,
  },
  strengthBar3: {
    width: 111,
  },
  strengthBarActive: {
    backgroundColor: SemanticColors.success,
  },
  strongPasswordText: {
    color: SemanticColors.success,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  createButton: {
    width: '100%',
    maxWidth: 343,
    height: 49,
    borderRadius: 12,
    backgroundColor: SemanticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  createButtonDisabled: {
    backgroundColor: SemanticColors.surfaceSecondary,
    opacity: 0.5,
  },
  createButtonText: {
    color: SemanticColors.textOnPrimary,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25.2,
  },
  createButtonTextDisabled: {
    color: SemanticColors.textTertiary,
  },
});

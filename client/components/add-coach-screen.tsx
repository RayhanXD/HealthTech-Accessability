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
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, FuturisticDesign, BorderRadius, ComponentTokens } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';
import { trainerAPI } from '@/lib/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AddCoachScreenProps {
  onContinue?: (email: string) => void;
  continueHref?: string;
}

export default function AddCoachScreen({
  onContinue,
  continueHref = '/congratulations',
}: AddCoachScreenProps) {
  const [coachEmail, setCoachEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20);

  useEffect(() => {
    // Optimized for 120Hz displays
    titleOpacity.value = withTiming(1, { 
      duration: 450, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
    titleTranslateY.value = withSpring(0, { 
      damping: 18, 
      stiffness: 150,
      mass: 0.5
    });

    setTimeout(() => {
      formOpacity.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      formTranslateY.value = withSpring(0, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
    }, 150);
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = (emailValue: string) => {
    if (emailValue.length === 0) {
      setEmailError('');
      return false;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError('Invalid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const isFormValid = () => {
    return isValidEmail(coachEmail) && coachEmail.length > 0;
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    // Validate email before proceeding
    const emailValid = validateEmail(coachEmail);
    
    if (!emailValid || !isFormValid()) {
      return;
    }

    setIsLoading(true);
    setEmailError('');

    try {
      // Get current player ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setEmailError('Please log in again');
        setIsLoading(false);
        return;
      }

      // Check if coach exists and add player to coach
      await trainerAPI.addPlayerToTrainerByEmail(coachEmail.trim().toLowerCase(), userId);
      
      // Success - proceed to next screen
      if (onContinue) {
        onContinue(coachEmail);
      } else {
        router.push('/congratulations' as any);
      }
    } catch (error: any) {
      // Handle error - show user-friendly message
      let errorMessage = 'Failed to add coach. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Provide specific error messages
      if (errorMessage.includes('No coach found') || errorMessage.includes('404') || errorMessage.includes('not found')) {
        setEmailError('No coach found with this email. Please check the email and try again.');
      } else if (errorMessage.includes('already assigned') || errorMessage.includes('already')) {
        setEmailError('You are already assigned to this coach.');
      } else if (errorMessage.includes('Player not found')) {
        setEmailError('Account error. Please log in again.');
      } else {
        setEmailError(errorMessage);
      }
      console.error('Error adding coach:', error);
    } finally {
      setIsLoading(false);
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
              width={203}
              backgroundColor={BrandColors.green}
              backgroundBarColor={BrandColors.white}
              borderRadius={999}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.titleSection, useAnimatedStyle(() => ({
          opacity: titleOpacity.value,
          transform: [{ translateY: titleTranslateY.value }],
        }))]}>
          <Text style={styles.title}>Add Coach</Text>
        </Animated.View>

        <Animated.View 
          style={[styles.formContainer, useAnimatedStyle(() => ({
            opacity: formOpacity.value,
            transform: [{ translateY: formTranslateY.value }],
          }))]}
          pointerEvents="box-none">
          <Text style={styles.description}>
            Enter coach email provided by your coach:
          </Text>

          {/* Email Input */}
          <View style={styles.emailFieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
              <TextInput
                style={styles.input}
                value={coachEmail}
                onChangeText={(text) => {
                  setCoachEmail(text);
                  if (text.length > 0) {
                    validateEmail(text);
                  } else {
                    setEmailError('');
                  }
                }}
                onBlur={() => validateEmail(coachEmail)}
                placeholder="example@email.com"
                placeholderTextColor={SemanticColors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                editable={true}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Continue Button */}
          <View style={styles.continueButtonContainer}>
            <AnimatedTouchableOpacity
              style={[
                styles.continueButton,
                (!isFormValid() || isLoading) && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              activeOpacity={0.9}
              disabled={!isFormValid() || isLoading}>
              <Text
                style={[
                  styles.continueButtonText,
                  (!isFormValid() || isLoading) && styles.continueButtonTextDisabled,
                ]}>
                {isLoading ? 'Adding...' : 'Continue'}
              </Text>
            </AnimatedTouchableOpacity>
          </View>
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
    height: 4,
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Typography.fontFamily.sans,
    color: SemanticColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: Spacing['2xl'],
  },
  emailFieldContainer: {
    marginBottom: Spacing['6xl'],
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
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
  },
  inputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: BrandColors.white,
    fontSize: 16,
    fontFamily: Typography.fontFamily.sans,
    padding: 0,
    minHeight: 20,
  },
  continueButtonContainer: {
    width: '100%',
    marginTop: Spacing['2xl'],
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...FuturisticDesign.glow,
  },
  continueButtonDisabled: {
    backgroundColor: SemanticColors.surfaceSecondary,
    opacity: 0.4,
  },
  continueButtonText: {
    color: BrandColors.white,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  continueButtonTextDisabled: {
    color: SemanticColors.textTertiary,
  },
});

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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { authAPI } from '@/lib/api/api';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CreateAccountScreenProps {
  onCreateAccount?: (email: string, password: string, firstName?: string, lastName?: string) => void;
  continueHref?: string;
}

export default function CreateAccountScreen({
  onCreateAccount,
  continueHref = '/add-coach',
}: CreateAccountScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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
      damping: 18, // Increased for smoother 120Hz
      stiffness: 150, // Increased for snappier response
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

  const validateFirstName = (firstNameValue: string) => {
    if (firstNameValue.length === 0) {
      setFirstNameError('');
      return false;
    }
    if (firstNameValue.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      return false;
    }
    setFirstNameError('');
    return true;
  };

  const validateLastName = (lastNameValue: string) => {
    if (lastNameValue.length === 0) {
      setLastNameError('');
      return false;
    }
    if (lastNameValue.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      return false;
    }
    setLastNameError('');
    return true;
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

  const validatePassword = (passwordValue: string) => {
    if (passwordValue.length === 0) {
      setPasswordError('');
      return false;
    }
    const strength = getPasswordStrength(passwordValue);
    if (strength < 3) {
      setPasswordError('Password not strong enough');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPasswordValue: string) => {
    if (confirmPasswordValue.length === 0) {
      setConfirmPasswordError('');
      return false;
    }
    if (password !== confirmPasswordValue) {
      setConfirmPasswordError('Passwords don\'t match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
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

  const handleCreateAccount = async () => {
    // Validate all fields
    const firstNameValid = validateFirstName(firstName);
    const lastNameValid = validateLastName(lastName);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const confirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!firstNameValid || !lastNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
      return;
    }

    if (!isFormValid()) return;
    
    setIsLoading(true);
    
    try {
      // Get user role to determine registration endpoint
      const userRole = await AsyncStorage.getItem('userRole');
      const isCoach = userRole === 'coach';
      
      // Prepare registration data
      const registrationData = {
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      
      // Register user based on role
      let response;
      if (isCoach) {
        response = await authAPI.registerTrainer(registrationData);
      } else {
        // For players, we might need additional data from health-data screen
        // For now, just register with basic info
        const age = await AsyncStorage.getItem('age');
        const bodyweight = await AsyncStorage.getItem('bodyweight');
        const height = await AsyncStorage.getItem('height');
        const sexAtBirth = await AsyncStorage.getItem('sexAtBirth');
        
        response = await authAPI.registerPlayer({
          ...registrationData,
          age: age ? parseInt(age) : undefined,
          bodyweight_in_pounds: bodyweight ? parseFloat(bodyweight) : undefined,
          height_in_inches: height ? parseFloat(height) : undefined,
          sex_at_birth: sexAtBirth || undefined,
        });
      }
      
      // Store user data
      await AsyncStorage.setItem('userRole', isCoach ? 'coach' : 'player');
      await AsyncStorage.setItem('userId', response.user.id);
      await AsyncStorage.setItem('firstName', firstName.trim());
      await AsyncStorage.setItem('lastName', lastName.trim());
      
      // Navigate based on role
      if (isCoach) {
        router.push('/congratulations' as any);
      } else {
        router.push('/add-coach' as any);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message
      let errorMessage = error.message || 'An error occurred during registration. Please try again.';
      
      // Provide more helpful message for duplicate email
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('email')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      }
      
      Alert.alert(
        'Registration Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
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
        <Animated.View style={[styles.titleSection, useAnimatedStyle(() => ({
          opacity: titleOpacity.value,
          transform: [{ translateY: titleTranslateY.value }],
        }))]}>
          <Text style={styles.title}>Create an account</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, useAnimatedStyle(() => ({
          opacity: formOpacity.value,
          transform: [{ translateY: formTranslateY.value }],
        }))]}>

        {/* First Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name</Text>
          <View style={[styles.inputContainer, firstNameError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (text.length > 0) {
                  validateFirstName(text);
                } else {
                  setFirstNameError('');
                }
              }}
              onBlur={() => validateFirstName(firstName)}
              placeholder="Enter your first name"
              placeholderTextColor={SemanticColors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
        </View>

        {/* Last Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last Name</Text>
          <View style={[styles.inputContainer, lastNameError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (text.length > 0) {
                  validateLastName(text);
                } else {
                  setLastNameError('');
                }
              }}
              onBlur={() => validateLastName(lastName)}
              placeholder="Enter your last name"
              placeholderTextColor={SemanticColors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
        </View>

        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text.length > 0) {
                  validateEmail(text);
                } else {
                  setEmailError('');
                }
              }}
              onBlur={() => validateEmail(email)}
              placeholder="example@email.com"
              placeholderTextColor={SemanticColors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text.length > 0) {
                  validatePassword(text);
                } else {
                  setPasswordError('');
                }
                // Re-validate confirm password when password changes
                if (confirmPassword.length > 0) {
                  validateConfirmPassword(confirmPassword);
                }
              }}
              onBlur={() => validatePassword(password)}
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
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Password Strength Indicator */}
        <View style={styles.passwordStrengthContainer}>
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
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputContainer, confirmPasswordError && styles.inputContainerError]}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (text.length > 0) {
                  validateConfirmPassword(text);
                } else {
                  setConfirmPasswordError('');
                }
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              placeholder="confirm your password"
              placeholderTextColor={SemanticColors.textTertiary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

        {/* Create Account Button */}
        <View style={styles.createButtonContainer}>
          <AnimatedTouchableOpacity
            style={[
              styles.createButton,
              (!isFormValid() || isLoading) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateAccount}
            activeOpacity={0.9}
            disabled={!isFormValid() || isLoading}>
            <Text
              style={[
                styles.createButtonText,
                (!isFormValid() || isLoading) && styles.createButtonTextDisabled,
              ]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
    justifyContent: 'space-between',
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
  passwordStrengthContainer: {
    marginBottom: Spacing['2xl'],
    width: '100%',
  },
  strengthBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  strengthBar1: {},
  strengthBar2: {},
  strengthBar3: {},
  strengthBarActive: {
    backgroundColor: BrandColors.green,
  },
  strongPasswordText: {
    color: BrandColors.green,
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  createButtonContainer: {
    width: '100%',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  createButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...FuturisticDesign.glow,
  },
  createButtonDisabled: {
    backgroundColor: SemanticColors.surfaceSecondary,
    opacity: 0.4,
  },
  createButtonText: {
    color: BrandColors.white,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 18,
    letterSpacing: 0.3,
  },
  createButtonTextDisabled: {
    color: SemanticColors.textTertiary,
  },
});

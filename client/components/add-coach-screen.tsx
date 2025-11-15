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
import { BrandColors } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';

interface AddCoachScreenProps {
  onContinue?: (email: string) => void;
  continueHref?: string;
}

export default function AddCoachScreen({
  onContinue,
  continueHref = '/congratulations',
}: AddCoachScreenProps) {
  const [coachEmail, setCoachEmail] = useState('');
  const router = useRouter();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return isValidEmail(coachEmail) && coachEmail.length > 0;
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!isFormValid()) return;
    
    if (onContinue) {
      onContinue(coachEmail);
    } else {
      router.push('/congratulations' as any);
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

      {/* Title and Description */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Add Coach</Text>
        <Text style={styles.description}>
          Enter coach email provided by your coach:
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.mainContent}>
        <View style={styles.emailFieldContainer}>
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
                value={coachEmail}
                onChangeText={setCoachEmail}
                placeholder="example@email.com"
                placeholderTextColor={BrandColors.white}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Svg width="100%" height={2} viewBox="0 0 345 2" fill="none">
              <Path
                d="M0.75 0.75H343.75"
                stroke="#8E55E3"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.continueSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid() && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.9}
          disabled={!isFormValid()}>
          <Text
            style={[
              styles.continueButtonText,
              !isFormValid() && styles.continueButtonTextDisabled,
            ]}>
            Continue
          </Text>
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
  },
  titleSection: {
    paddingHorizontal: 32,
    marginBottom: 32,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 16.5,
    fontWeight: '500',
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 328,
    alignSelf: 'center',
    marginBottom: 48,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  emailFieldContainer: {
    marginBottom: 32,
    maxWidth: 343,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    color: BrandColors.white,
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
  inputIcon: {
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    color: BrandColors.white,
    fontSize: 14,
  },
  continueSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 48,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 293,
    height: 43,
    borderRadius: 15,
    backgroundColor: BrandColors.purpleDark,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  continueButtonText: {
    color: BrandColors.lightGray,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25.2,
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';

type Gender = 'male' | 'female' | 'other' | null;

interface GenderSelectionScreenProps {
  onContinue?: (gender: Gender) => void;
  continueHref?: string;
}

export default function GenderSelectionScreen({
  onContinue,
  continueHref = '/next',
}: GenderSelectionScreenProps) {
  const [selectedGender, setSelectedGender] = useState<Gender>(null);
  const router = useRouter();

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    // Auto-advance to next page after selection
    if (onContinue) {
      onContinue(gender);
    } else {
      router.push('/next' as any);
    }
  };

  const handleBack = () => {
    router.back();
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
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Choose your gender</Text>

        <View style={styles.genderButtons}>
          <GenderButton
            label="Male"
            isSelected={selectedGender === 'male'}
            onPress={() => handleGenderSelect('male')}
          />
          <GenderButton
            label="Female"
            isSelected={selectedGender === 'female'}
            onPress={() => handleGenderSelect('female')}
          />
          <GenderButton
            label="Other"
            isSelected={selectedGender === 'other'}
            onPress={() => handleGenderSelect('other')}
          />
        </View>
      </View>
    </View>
  );
}

interface GenderButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function GenderButton({ label, isSelected, onPress }: GenderButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.genderButton,
        isSelected && styles.genderButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.genderButtonText,
          isSelected && styles.genderButtonTextSelected,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
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
    marginBottom: 32,
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
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: BrandColors.white,
    borderRadius: 999,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 32,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 48,
  },
  genderButtons: {
    gap: 16,
  },
  genderButton: {
    width: '100%',
    height: 43,
    borderRadius: 15,
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    backgroundColor: BrandColors.purpleDark,
  },
  genderButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: BrandColors.white,
  },
  genderButtonTextSelected: {
    color: BrandColors.white,
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
  continueButtonText: {
    color: BrandColors.lightGray,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
      lineHeight: 25.2,
    },
  });

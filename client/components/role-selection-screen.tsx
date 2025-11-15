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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';

type Role = 'coach' | 'athlete' | null;

interface RoleSelectionScreenProps {
  onContinue?: (role: Role) => void;
  continueHref?: string;
}

export default function RoleSelectionScreen({
  onContinue,
  continueHref = '/role-selection',
}: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const router = useRouter();

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    // Save role to AsyncStorage
    if (role) {
      await AsyncStorage.setItem('userRole', role);
    }
    // Auto-advance to next page after selection
    if (onContinue) {
      onContinue(role);
    } else {
      router.push('/role-selection' as any);
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
          <View style={styles.progressBarContainer}>
            <AnimatedProgressBar
              width={55}
              backgroundColor="#78E66C"
              backgroundBarColor={BrandColors.white}
              borderRadius={999}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>
          Are you a Coach{'\n'}or an Athlete?
        </Text>

        <View style={styles.roleButtons}>
          <RoleButton
            label="Coach"
            isSelected={selectedRole === 'coach'}
            onPress={() => handleRoleSelect('coach')}
          />
          <RoleButton
            label="Athlete"
            isSelected={selectedRole === 'athlete'}
            onPress={() => handleRoleSelect('athlete')}
          />
        </View>
      </View>
    </View>
  );
}

interface RoleButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function RoleButton({ label, isSelected, onPress }: RoleButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.roleButton,
        isSelected && styles.roleButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text
        style={[
          styles.roleButtonText,
          isSelected && styles.roleButtonTextSelected,
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
  progressBarContainer: {
    flex: 1,
    height: 6,
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
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
  roleButtons: {
    gap: 22,
    maxWidth: 293,
    alignSelf: 'center',
    width: '100%',
  },
  roleButton: {
    width: '100%',
    height: 67,
    borderRadius: 15,
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonSelected: {
    backgroundColor: BrandColors.purpleDark,
  },
  roleButtonText: {
    fontSize: 30,
    fontWeight: '500',
    color: BrandColors.white,
  },
  roleButtonTextSelected: {
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

import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, FuturisticDesign, BorderRadius } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const button1Opacity = useSharedValue(0);
  const button1TranslateY = useSharedValue(20);
  const button2Opacity = useSharedValue(0);
  const button2TranslateY = useSharedValue(20);

  useEffect(() => {
    // Staggered entrance animations
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    titleTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    setTimeout(() => {
      button1Opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      button1TranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    }, 100);

    setTimeout(() => {
      button2Opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      button2TranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    }, 200);
  }, []);

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    // Save role to AsyncStorage
    if (role) {
      await AsyncStorage.setItem('userRole', role);
    }
    // Auto-advance to next page after selection with slight delay for feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue(role);
      } else {
        router.push('/create-account' as any);
      }
    }, 200);
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
        <Animated.View style={[styles.titleContainer, useAnimatedStyle(() => ({
          opacity: titleOpacity.value,
          transform: [{ translateY: titleTranslateY.value }],
        }))]}>
          <Text style={styles.title}>
            Are you a Coach{'\n'}or an Athlete?
          </Text>
        </Animated.View>

        <View style={styles.roleButtons}>
          <Animated.View style={useAnimatedStyle(() => ({
            opacity: button1Opacity.value,
            transform: [{ translateY: button1TranslateY.value }],
          }))}>
            <RoleButton
              label="Coach"
              isSelected={selectedRole === 'coach'}
              onPress={() => handleRoleSelect('coach')}
            />
          </Animated.View>
          <Animated.View style={useAnimatedStyle(() => ({
            opacity: button2Opacity.value,
            transform: [{ translateY: button2TranslateY.value }],
          }))}>
            <RoleButton
              label="Athlete"
              isSelected={selectedRole === 'athlete'}
              onPress={() => handleRoleSelect('athlete')}
            />
          </Animated.View>
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
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isSelected ? 0.3 : 0);

  useEffect(() => {
    glowOpacity.value = withTiming(isSelected ? 0.3 : 0, { duration: 300 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.roleButton,
        isSelected && styles.roleButtonSelected,
        animatedStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}>
      <Animated.View style={[styles.roleButtonGlow, glowStyle]} />
      <Text
        style={[
          styles.roleButtonText,
          isSelected && styles.roleButtonTextSelected,
        ]}>
        {label}
      </Text>
    </AnimatedTouchableOpacity>
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
  titleContainer: {
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
  roleButtons: {
    gap: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  roleButton: {
    width: '100%',
    height: 72,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  roleButtonSelected: {
    backgroundColor: BrandColors.purple,
    borderColor: BrandColors.purple,
    ...FuturisticDesign.glowSubtle,
  },
  roleButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: BrandColors.purple,
    opacity: 0.2,
  },
  roleButtonText: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: Typography.fontFamily.medium,
    color: SemanticColors.textSecondary,
    letterSpacing: 0.2,
  },
  roleButtonTextSelected: {
    color: BrandColors.white,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: '600',
    fontSize: 20,
  },
  });

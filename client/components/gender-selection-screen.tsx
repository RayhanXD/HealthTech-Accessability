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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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

  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const button1Opacity = useSharedValue(0);
  const button1TranslateY = useSharedValue(20);
  const button2Opacity = useSharedValue(0);
  const button2TranslateY = useSharedValue(20);
  const button3Opacity = useSharedValue(0);
  const button3TranslateY = useSharedValue(20);

  useEffect(() => {
    // Optimized staggered entrance animations for 120Hz displays
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
      button1Opacity.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      button1TranslateY.value = withSpring(0, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
    }, 80);

    setTimeout(() => {
      button2Opacity.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      button2TranslateY.value = withSpring(0, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
    }, 150);

    setTimeout(() => {
      button3Opacity.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      button3TranslateY.value = withSpring(0, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
    }, 220);
  }, []);

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    // Auto-advance to next page after selection with slight delay for feedback
    setTimeout(() => {
      if (onContinue) {
        onContinue(gender);
      } else {
        router.push('/next' as any);
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
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.titleContainer, useAnimatedStyle(() => ({
          opacity: titleOpacity.value,
          transform: [{ translateY: titleTranslateY.value }],
        }))]}>
          <Text style={styles.title}>Choose your gender</Text>
        </Animated.View>

        <View style={styles.genderButtons}>
          <Animated.View style={useAnimatedStyle(() => ({
            opacity: button1Opacity.value,
            transform: [{ translateY: button1TranslateY.value }],
          }))}>
            <GenderButton
              label="Male"
              isSelected={selectedGender === 'male'}
              onPress={() => handleGenderSelect('male')}
            />
          </Animated.View>
          <Animated.View style={useAnimatedStyle(() => ({
            opacity: button2Opacity.value,
            transform: [{ translateY: button2TranslateY.value }],
          }))}>
            <GenderButton
              label="Female"
              isSelected={selectedGender === 'female'}
              onPress={() => handleGenderSelect('female')}
            />
          </Animated.View>
          <Animated.View style={useAnimatedStyle(() => ({
            opacity: button3Opacity.value,
            transform: [{ translateY: button3TranslateY.value }],
          }))}>
            <GenderButton
              label="Other"
              isSelected={selectedGender === 'other'}
              onPress={() => handleGenderSelect('other')}
            />
          </Animated.View>
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
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isSelected ? 0.3 : 0);

  useEffect(() => {
    // Optimized for 120Hz - faster transition with smoother easing
    glowOpacity.value = withTiming(isSelected ? 0.3 : 0, { 
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    // Optimized spring for 120Hz - higher damping and stiffness
    scale.value = withSequence(
      withSpring(0.96, { 
        damping: 15, 
        stiffness: 400,
        mass: 0.5
      }),
      withSpring(1, { 
        damping: 15, 
        stiffness: 400,
        mass: 0.5
      })
    );
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.genderButton,
        isSelected && styles.genderButtonSelected,
        animatedStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}>
      <Animated.View style={[styles.genderButtonGlow, glowStyle]} />
      <Text
        style={[
          styles.genderButtonText,
          isSelected && styles.genderButtonTextSelected,
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
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  genderButtons: {
    gap: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  genderButton: {
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
  genderButtonSelected: {
    backgroundColor: BrandColors.purple,
    borderColor: BrandColors.purple,
    ...FuturisticDesign.glowSubtle,
  },
  genderButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: BrandColors.purple,
    opacity: 0.2,
  },
  genderButtonText: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: Typography.fontFamily.medium,
    color: SemanticColors.textSecondary,
    letterSpacing: 0.2,
  },
  genderButtonTextSelected: {
    color: BrandColors.white,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: '600',
    fontSize: 20,
  },
  });

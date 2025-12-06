import React, { useEffect, useState } from 'react';
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
import { Image } from 'expo-image';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';


interface CongratulationsScreenProps {
  userName?: string;
  onContinue?: () => void;
  continueHref?: string;
}

export default function CongratulationsScreen({
  userName,
  onContinue,
  continueHref = '/sign-in',
}: CongratulationsScreenProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>('');

  // Animation values
  const headingOpacity = useSharedValue(0);
  const headingTranslateY = useSharedValue(20);
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const messageTranslateY = useSharedValue(20);

  // Load firstName from AsyncStorage
  useEffect(() => {
    const loadFirstName = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem('firstName');
        if (storedFirstName) {
          setFirstName(storedFirstName);
        } else if (userName) {
          // Fallback to userName prop if firstName not found
          setFirstName(userName);
        }
      } catch (error) {
        console.error('Error loading firstName:', error);
        if (userName) {
          setFirstName(userName);
        }
      }
    };
    loadFirstName();
  }, [userName]);

  useEffect(() => {
    // Optimized staggered entrance animations for 120Hz displays
    headingOpacity.value = withTiming(1, { 
      duration: 450, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
    headingTranslateY.value = withSpring(0, { 
      damping: 18, 
      stiffness: 150,
      mass: 0.5
    });

    setTimeout(() => {
      iconScale.value = withSpring(1, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
      iconOpacity.value = withTiming(1, { 
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    }, 150);

    setTimeout(() => {
      messageOpacity.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });
      messageTranslateY.value = withSpring(0, { 
        damping: 18, 
        stiffness: 150,
        mass: 0.5
      });
    }, 300);
  }, []);

  // Auto-advance after animations complete (synchronized with other screens)
  useEffect(() => {
    // All animations complete around 600ms, then add delay to match other screens (200ms pattern)
    const autoAdvanceTimer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      } else {
        router.push('/sign-in' as any);
      }
    }, 1700); // 600ms for animations + 900ms to show the celebration

    return () => {
      clearTimeout(autoAdvanceTimer);
    };
  }, [onContinue, router]);

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
            <AnimatedProgressBar
              width={306}
              backgroundColor={BrandColors.green}
              backgroundBarColor={BrandColors.white}
              borderRadius={3}
            />
          </View>
        </View>
      </View>

      {/* Main Content - Centered */}
      <View style={styles.mainContent}>
        {/* Congratulations Heading */}
        <Animated.View style={[styles.headingSection, useAnimatedStyle(() => ({
          opacity: headingOpacity.value,
          transform: [{ translateY: headingTranslateY.value }],
        }))]}>
          <Text style={styles.heading}>
            Congrats, {firstName || ''}
          </Text>
        </Animated.View>

        {/* Success Icon */}
        <Animated.View style={[styles.iconSection, useAnimatedStyle(() => ({
          opacity: iconOpacity.value,
          transform: [{ scale: iconScale.value }],
        }))]}>
          <View style={styles.iconContainer}>
            {/* Outer white circle */}
            <Svg
              width={209}
              height={210}
              viewBox="0 0 209 210"
              fill="none"
              style={styles.outerCircle}>
              <Ellipse cx="104.5" cy="105" rx="104.5" ry="105" fill="white" />
            </Svg>

            {/* Inner black circle */}
            <View style={styles.innerCircleContainer}>
              <Svg width={190} height={190} viewBox="0 0 190 190" fill="none">
                <Circle cx="95" cy="95" r="95" fill="black" />
              </Svg>
            </View>

            {/* Checkmark image */}
            <View style={styles.checkmarkContainer}>
              <Image
                source={{
                  uri: 'https://api.builder.io/api/v1/image/assets/TEMP/c64d7dd959a49c2bad1d3644ed20a5f77e84eaf2?width=370',
                }}
                style={styles.checkmarkImage}
                contentFit="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Completion Message */}
        <Animated.View style={[styles.messageSection, useAnimatedStyle(() => ({
          opacity: messageOpacity.value,
          transform: [{ translateY: messageTranslateY.value }],
        }))]}>
          <Text style={styles.message}>
            You have finished setting up your account!
          </Text>
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
    paddingTop: Spacing['6xl'],
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  headingSection: {
    marginBottom: Spacing['2xl'],
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: BrandColors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 209,
    height: 210,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 209,
    height: 210,
    top: 0,
    left: 0,
  },
  innerCircleContainer: {
    position: 'absolute',
    width: 190,
    height: 190,
    top: 10,
    left: 9.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    width: 185,
    height: 185,
    top: 12.5,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkImage: {
    width: 185,
    height: 185,
  },
  messageSection: {
    marginBottom: Spacing['4xl'],
    width: '100%',
    alignSelf: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Typography.fontFamily.sans,
    color: SemanticColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  });

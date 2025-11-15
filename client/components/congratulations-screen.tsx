import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Svg, { Path, Ellipse, Circle } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';

interface CongratulationsScreenProps {
  userName?: string;
  onContinue?: () => void;
  continueHref?: string;
}

export default function CongratulationsScreen({
  userName = 'Anjana',
  onContinue,
  continueHref = '/sign-in',
}: CongratulationsScreenProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/sign-in' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar - Empty to maintain spacing */}
      <View style={styles.statusBar} />

      {/* Back Button & Full Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width={34} height={37} viewBox="0 0 34 37" fill="none">
              <Path
                d="M21 12L13 18.5L21 25"
                stroke="black"
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

      {/* Congratulations Heading */}
      <View style={styles.headingSection}>
        <Text style={styles.heading}>
          Congratulations {userName}!
        </Text>
      </View>

      {/* Success Icon */}
      <View style={styles.iconSection}>
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
      </View>

      {/* Completion Message */}
      <View style={styles.messageSection}>
        <Text style={styles.message}>
          You have finished setting up your account!
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.continueSection}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    ...(Platform.OS === 'ios' && { paddingTop: 8 }),
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.white,
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
    backgroundColor: BrandColors.white,
    borderRadius: 3,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: 306,
    backgroundColor: BrandColors.green,
    borderRadius: 3,
  },
  headingSection: {
    paddingHorizontal: 32,
    marginBottom: 32,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 38,
    lineHeight: 41.8,
    fontWeight: '500',
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 356,
    alignSelf: 'center',
  },
  iconSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
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
    paddingHorizontal: 32,
    marginBottom: 48,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  message: {
    fontSize: 19,
    lineHeight: 20.9,
    fontWeight: '500',
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 355,
    alignSelf: 'center',
  },
  continueSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
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

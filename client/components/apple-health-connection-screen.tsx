import React from 'react';
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
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';
import AnimatedProgressBar from './animated-progress-bar';

interface AppleHealthConnectionScreenProps {
  onAllow?: () => void;
  onNotNow?: () => void;
  continueHref?: string;
}

export default function AppleHealthConnectionScreen({
  onAllow,
  onNotNow,
  continueHref = '/create-account',
}: AppleHealthConnectionScreenProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNotNow = () => {
    if (onNotNow) {
      onNotNow();
    } else {
      router.push('/create-account' as any);
    }
  };

  const handleAllow = () => {
    if (onAllow) {
      onAllow();
    } else {
      router.push('/create-account' as any);
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
              width={103}
              backgroundColor={BrandColors.green}
              backgroundBarColor={BrandColors.progressGray}
              borderRadius={999}
            />
          </View>
        </View>
      </View>

      {/* Integration Card */}
      <View style={styles.integrationCardSection}>
        <View style={styles.integrationCard}>
          {/* Syntra Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.syntraLogoBox}>
              <Text style={styles.syntraLogoText}>syntra</Text>
            </View>
          </View>

          {/* Connection Line */}
          <View style={styles.connectionLine} />

          {/* Apple Health Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.appleHealthLogoBox}>
              <Image
                source={{
                  uri: 'https://api.builder.io/api/v1/image/assets/TEMP/42dc68db888c24bb3abfa50d53035d5624403029?width=136',
                }}
                style={styles.appleHealthImage}
                contentFit="cover"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>
          Connect to{'\n'}Apple Health
        </Text>

        <Text style={styles.description}>
          Do you consent to providing access to Apple Health to sync your daily
          activity between Prehab and Health app
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsSection}>
        <TouchableOpacity
          style={styles.allowButton}
          onPress={handleAllow}
          activeOpacity={0.9}>
          <Text style={styles.allowButtonText}>Allow Health Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notNowButton}
          onPress={handleNotNow}
          activeOpacity={0.7}>
          <Text style={styles.notNowButtonText}>Not now</Text>
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
    marginBottom: 32,
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
    borderRadius: 999,
    overflow: 'hidden',
  },
  integrationCardSection: {
    paddingHorizontal: 32,
    marginBottom: 48,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  integrationCard: {
    backgroundColor: BrandColors.cardGray,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    height: 126,
    maxWidth: 327,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  syntraLogoBox: {
    width: 68,
    height: 70,
    borderRadius: 15,
    backgroundColor: BrandColors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syntraLogoText: {
    color: BrandColors.purple,
    fontWeight: '500',
    fontSize: 19,
  },
  connectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: BrandColors.black,
    maxWidth: 100,
  },
  appleHealthLogoBox: {
    width: 68,
    height: 70,
    borderRadius: 15,
    backgroundColor: BrandColors.white,
    overflow: 'hidden',
  },
  appleHealthImage: {
    width: 68,
    height: 70,
    borderRadius: 15,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 32,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 16.5,
    fontWeight: '500',
    color: BrandColors.white,
    maxWidth: 328,
    textAlign: 'center',
    marginBottom: 32,
  },
  actionButtonsSection: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  allowButton: {
    width: '100%',
    maxWidth: 293,
    height: 43,
    borderRadius: 15,
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  allowButtonText: {
    color: BrandColors.lightGray,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25.2,
  },
  notNowButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notNowButtonText: {
    color: BrandColors.white,
    fontSize: 15,
    fontWeight: '500',
      lineHeight: 16.5,
    },
  });
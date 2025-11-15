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
import { useRouter } from 'expo-router';
import { BrandColors} from '@/constants/theme';

interface WelcomeScreenProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function WelcomeScreen({
  onSignUp,
  onSignIn,
}: WelcomeScreenProps) {
  const router = useRouter();

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      router.push('/gender-selection' as any);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      router.push('/sign-in' as any);
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
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>
        Welcome to <Text style={styles.titleHighlight}>Syntra</Text>
        </Text>

      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsSection}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          activeOpacity={0.9}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.7}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 38,
    lineHeight: 41.8,
    fontWeight: '500',
    color: BrandColors.white,
    textAlign: 'center',
  },
  titleHighlight: {
  color: BrandColors.purple,

},
  actionButtonsSection: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
  },
  signUpButton: {
    width: '100%',
    maxWidth: 293,
    height: 43,
    borderRadius: 15,
    backgroundColor: BrandColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  signUpButtonText: {
    color: BrandColors.lightGray,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 25.2,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 293,
    alignSelf: 'center',
  },
  signInText: {
    color: BrandColors.purple,
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: 19.6,
  },
  signInLink: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 19.6,
  },
});


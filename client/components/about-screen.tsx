import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height dynamically
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12
    : (StatusBar.currentHeight || 0) + 12;

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Dynamic top spacing to prevent status bar overlap */}
        <View style={{ height: statusBarHeight }} />
        
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke={BrandColors.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.navTitle}>About</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* App Logo/Icon Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appName}>Syntra</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* App Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Syntra</Text>
            <Text style={styles.paragraph}>
              Syntra is a comprehensive health monitoring application designed for coaches and trainers to efficiently manage and monitor their players' health data. Our platform provides a centralized dashboard where coaches and trainers can view all their players' health metrics at once, track player statuses, and gain valuable insights from aggregated health data.
            </Text>
            <Text style={styles.paragraph}>
              Syntra integrates seamlessly with wearable devices and health data sources to provide real-time health monitoring and analytics, helping coaches and trainers make informed decisions about player health and wellness.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <Text style={styles.bulletPoint}>• Centralized dashboard for viewing all players' health data</Text>
            <Text style={styles.bulletPoint}>• Real-time player status monitoring</Text>
            <Text style={styles.bulletPoint}>• Comprehensive health metrics tracking</Text>
            <Text style={styles.bulletPoint}>• Data insights and analytics</Text>
            <Text style={styles.bulletPoint}>• Integration with wearable devices</Text>
            <Text style={styles.bulletPoint}>• Secure data storage and privacy protection</Text>
          </View>

          {/* Development Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development</Text>
            <Text style={styles.paragraph}>
              Syntra is developed by Texas Convergent, a student organization at the University of Texas at Austin dedicated to building innovative technology solutions.
            </Text>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions, feedback, or need support, please reach out to us:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>support@convergent.health</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website:</Text>
              <Text style={styles.contactValue}>www.convergent.health</Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => router.push('/terms-and-conditions')}>
              <Text style={styles.linkText}>Terms and Conditions</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightSection}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} Texas Convergent. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  navBar: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    color: SemanticColors.primary,
    fontSize: 24,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SemanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold as any,
    color: SemanticColors.textOnPrimary,
  },
  appName: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.md,
  },
  paragraph: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  bulletPoint: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  contactLabel: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    fontWeight: Typography.fontWeight.medium as any,
    marginRight: Spacing.sm,
    width: 80,
  },
  contactValue: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    flex: 1,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  linkText: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.primary,
    fontWeight: Typography.fontWeight.medium as any,
  },
  copyrightSection: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.borderMuted,
  },
  copyrightText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    textAlign: 'center',
  },
});


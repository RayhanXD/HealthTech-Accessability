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

export default function TermsAndConditionsScreen() {
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
          <Text style={styles.navTitle}>Terms and Conditions</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Syntra, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Syntra is a health monitoring application designed for coaches and trainers to view all their players' health data at once. The application provides easy access to view player statuses, monitor health metrics, and gain insights from aggregated health data. Syntra integrates with wearable devices and health data sources to provide comprehensive health monitoring and analytics for teams.
          </Text>

          <Text style={styles.sectionTitle}>3. Health Data and Privacy</Text>
          <Text style={styles.paragraph}>
            Syntra collects and processes health-related data from players, including but not limited to heart rate, sleep patterns, activity levels, and other physiological metrics. By using Syntra, you consent to the collection, storage, and processing of health data as described in our Privacy Policy.
          </Text>
          <Text style={styles.paragraph}>
            Health data is stored securely and is used solely for the purpose of providing health monitoring, status tracking, and data insights for coaches and trainers. This data is aggregated and presented in dashboards to help coaches and trainers make informed decisions about player health and wellness. We do not sell personal health information to third parties.
          </Text>

          <Text style={styles.sectionTitle}>4. Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            IMPORTANT: Syntra is not a substitute for professional medical advice, diagnosis, or treatment. The information provided by Syntra is for informational purposes only and should not be used as a basis for medical decisions.
          </Text>
          <Text style={styles.paragraph}>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or seen in Syntra.
          </Text>
          <Text style={styles.paragraph}>
            Syntra does not provide medical diagnosis, treatment recommendations, or emergency medical services. If you believe you may have a medical emergency, call your doctor or emergency services immediately.
          </Text>

          <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate and complete information when using Syntra</Text>
          <Text style={styles.bulletPoint}>• Keep your account information up to date</Text>
          <Text style={styles.bulletPoint}>• Not share your account credentials with others</Text>
          <Text style={styles.bulletPoint}>• Use Syntra in compliance with all applicable laws and regulations</Text>
          <Text style={styles.bulletPoint}>• Not use Syntra for any unlawful or unauthorized purpose</Text>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the fullest extent permitted by law, Syntra and its developers, operators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of Syntra.
          </Text>

          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of Syntra, including but not limited to text, graphics, logos, icons, images, and software, are the property of Syntra developers or their content suppliers and are protected by copyright, trademark, and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>8. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms and conditions at any time. We will notify users of any material changes by updating the "Last Updated" date at the top of this document. Your continued use of Syntra after such modifications constitutes acceptance of the updated terms.
          </Text>

          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your access to Syntra at any time, with or without cause or notice, for any reason, including but not limited to breach of these Terms and Conditions.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Email: support@convergent.health{'\n'}
            Website: www.convergent.health
          </Text>

          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
          </Text>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              By using Syntra, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing['3xl'],
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginTop: Spacing['2xl'],
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
  acknowledgment: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: SemanticColors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
  },
  acknowledgmentText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium as any,
    color: SemanticColors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
});


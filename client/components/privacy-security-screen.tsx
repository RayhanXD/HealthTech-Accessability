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

export default function PrivacySecurityScreen() {
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
          <Text style={styles.navTitle}>Privacy & Security</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
          
          <Text style={styles.sectionTitle}>1. Our Commitment to Privacy</Text>
          <Text style={styles.paragraph}>
            At Syntra, we are committed to protecting your privacy and ensuring the security of your personal health information. This Privacy & Security policy explains how we collect, use, store, and protect your data.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect several types of information to provide and improve our service:
          </Text>
          <Text style={styles.bulletPoint}>• Account information (name, email, profile details)</Text>
          <Text style={styles.bulletPoint}>• Health and fitness data from connected devices</Text>
          <Text style={styles.bulletPoint}>• Usage data (how you interact with the app)</Text>
          <Text style={styles.bulletPoint}>• Device information (device type, operating system)</Text>
          <Text style={styles.bulletPoint}>• Team and coach assignments</Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            Your information is used exclusively for the following purposes:
          </Text>
          <Text style={styles.bulletPoint}>• Providing health monitoring and analytics services</Text>
          <Text style={styles.bulletPoint}>• Enabling coach and team dashboard functionality</Text>
          <Text style={styles.bulletPoint}>• Improving app features and user experience</Text>
          <Text style={styles.bulletPoint}>• Sending important notifications about your account</Text>
          <Text style={styles.bulletPoint}>• Complying with legal obligations</Text>
          <Text style={styles.bulletPoint}>• Ensuring platform security and preventing fraud</Text>

          <Text style={styles.sectionTitle}>4. Data Security Measures</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your data:
          </Text>
          <Text style={styles.bulletPoint}>• End-to-end encryption for data transmission</Text>
          <Text style={styles.bulletPoint}>• Encrypted storage of all health data at rest</Text>
          <Text style={styles.bulletPoint}>• Multi-factor authentication support</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and penetration testing</Text>
          <Text style={styles.bulletPoint}>• Secure cloud infrastructure with SOC 2 compliance</Text>
          <Text style={styles.bulletPoint}>• Role-based access controls for team data</Text>
          <Text style={styles.bulletPoint}>• Automatic session timeout and security monitoring</Text>

          <Text style={styles.sectionTitle}>5. Who Can Access Your Data</Text>
          <Text style={styles.paragraph}>
            Access to your health data is strictly controlled:
          </Text>
          <Text style={styles.bulletPoint}>• You have full access to all your personal data</Text>
          <Text style={styles.bulletPoint}>• Authorized coaches can view data for their assigned players</Text>
          <Text style={styles.bulletPoint}>• Team administrators can view aggregated team metrics</Text>
          <Text style={styles.bulletPoint}>• Syntra support staff only access data when necessary for troubleshooting with your explicit permission</Text>
          <Text style={styles.bulletPoint}>• We never sell or share your data with third-party advertisers</Text>

          <Text style={styles.sectionTitle}>6. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Syntra integrates with third-party services to provide full functionality:
          </Text>
          <Text style={styles.bulletPoint}>• Wearable device manufacturers (Apple Health, Garmin, Fitbit, etc.)</Text>
          <Text style={styles.bulletPoint}>• Cloud hosting providers for secure data storage</Text>
          <Text style={styles.bulletPoint}>• Analytics services for app improvement (anonymized data only)</Text>
          <Text style={styles.paragraph}>
            We carefully vet all third-party services and ensure they meet our privacy and security standards. We only share the minimum data necessary for these services to function.
          </Text>

          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your data according to the following guidelines:
          </Text>
          <Text style={styles.bulletPoint}>• Active account data is retained while your account remains active</Text>
          <Text style={styles.bulletPoint}>• Historical health data is preserved to provide trend analysis</Text>
          <Text style={styles.bulletPoint}>• After account deletion, personal data is removed within 90 days</Text>
          <Text style={styles.bulletPoint}>• Anonymized aggregated data may be retained for research purposes</Text>
          <Text style={styles.bulletPoint}>• Legal or regulatory requirements may necessitate longer retention</Text>

          <Text style={styles.sectionTitle}>8. Your Privacy Rights</Text>
          <Text style={styles.paragraph}>
            You have the following rights regarding your personal data:
          </Text>
          <Text style={styles.bulletPoint}>• Right to access all your personal data</Text>
          <Text style={styles.bulletPoint}>• Right to download your data in a portable format</Text>
          <Text style={styles.bulletPoint}>• Right to correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Right to delete your data (right to be forgotten)</Text>
          <Text style={styles.bulletPoint}>• Right to restrict or object to data processing</Text>
          <Text style={styles.bulletPoint}>• Right to withdraw consent at any time</Text>
          <Text style={styles.bulletPoint}>• Right to control who can view your health data</Text>

          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Syntra is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </Text>
          <Text style={styles.paragraph}>
            For users aged 13-17, we require parental or guardian consent before creating an account and collecting health data.
          </Text>

          <Text style={styles.sectionTitle}>10. Data Breach Notification</Text>
          <Text style={styles.paragraph}>
            In the unlikely event of a data breach that affects your personal information:
          </Text>
          <Text style={styles.bulletPoint}>• We will notify you within 72 hours of discovering the breach</Text>
          <Text style={styles.bulletPoint}>• We will provide details about what data was affected</Text>
          <Text style={styles.bulletPoint}>• We will outline steps we're taking to address the breach</Text>
          <Text style={styles.bulletPoint}>• We will provide recommendations to protect your information</Text>

          <Text style={styles.sectionTitle}>11. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your data may be transferred to and processed in countries other than your country of residence. We ensure that all international data transfers comply with applicable data protection laws, including GDPR for EU users and other regional privacy regulations.
          </Text>

          <Text style={styles.sectionTitle}>12. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            Syntra uses minimal tracking technologies:
          </Text>
          <Text style={styles.bulletPoint}>• Essential cookies for app functionality and authentication</Text>
          <Text style={styles.bulletPoint}>• Analytics cookies to understand app usage (can be disabled)</Text>
          <Text style={styles.bulletPoint}>• No third-party advertising or tracking cookies</Text>
          <Text style={styles.paragraph}>
            You can manage cookie preferences in your device settings or app preferences.
          </Text>

          <Text style={styles.sectionTitle}>13. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy & Security policy from time to time. We will notify you of any material changes by:
          </Text>
          <Text style={styles.bulletPoint}>• Updating the "Last Updated" date at the top of this policy</Text>
          <Text style={styles.bulletPoint}>• Sending an in-app notification for significant changes</Text>
          <Text style={styles.bulletPoint}>• Requiring you to review and accept major policy updates</Text>


          <Text style={styles.sectionTitle}>14. Compliance</Text>
          <Text style={styles.paragraph}>
            Syntra is designed to comply with major privacy regulations including:
          </Text>
          <Text style={styles.bulletPoint}>• HIPAA (Health Insurance Portability and Accountability Act)</Text>
          <Text style={styles.bulletPoint}>• GDPR (General Data Protection Regulation)</Text>
          <Text style={styles.bulletPoint}>• CCPA (California Consumer Privacy Act)</Text>
          <Text style={styles.bulletPoint}>• Other applicable regional privacy laws</Text>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              Your privacy and security are our top priorities. We are committed to maintaining the highest standards of data protection and transparency.
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

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

export default function HelpSupportScreen() {
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
          <Text style={styles.navTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.introText}>
            We're here to help! Find answers to common questions and learn how to get the most out of Syntra.
          </Text>
          
          <Text style={styles.sectionTitle}>1. Getting Started</Text>
          <Text style={styles.paragraph}>
            New to Syntra? Here are the basics to get you up and running:
          </Text>
          <Text style={styles.bulletPoint}>• Create your account and complete your profile</Text>
          <Text style={styles.bulletPoint}>• Connect your wearable devices (Apple Health, Garmin, Fitbit, etc.)</Text>
          <Text style={styles.bulletPoint}>• Join your team using the invite code from your coach</Text>
          <Text style={styles.bulletPoint}>• Ensure health data syncing is enabled on your device</Text>
          <Text style={styles.bulletPoint}>• Set your notification preferences for important updates</Text>

          <Text style={styles.sectionTitle}>2. For Players</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Viewing Your Health Data{'\n'}</Text>
            Your dashboard displays real-time health metrics including heart rate, sleep quality, recovery status, and activity levels. Data automatically syncs from your connected devices.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Understanding Your Status{'\n'}</Text>
            Your health status is indicated by color-coded indicators: green (optimal), yellow (caution), red (needs attention). These help your coach understand your readiness.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Privacy Controls{'\n'}</Text>
            You control who can see your health data. By default, only your assigned coaches can view your information. You can adjust these settings in Privacy & Security.
          </Text>

          <Text style={styles.sectionTitle}>3. For Coaches</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Team Dashboard{'\n'}</Text>
            View all your players' health status at a glance. Color-coded indicators help you quickly identify players who may need attention or rest.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Individual Player Insights{'\n'}</Text>
            Tap any player to see detailed health metrics, trends, and historical data. Use this information to make informed decisions about training and recovery.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Adding Players{'\n'}</Text>
            Generate invite codes for your players from the team management section. Players join by entering this code during account setup.
          </Text>

          <Text style={styles.sectionTitle}>4. Troubleshooting</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Data Not Syncing?{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Check that your wearable device is connected and charged</Text>
          <Text style={styles.bulletPoint}>• Ensure Syntra has permission to access health data in your device settings</Text>
          <Text style={styles.bulletPoint}>• Verify your device's app (Apple Health, Garmin Connect, etc.) is up to date</Text>
          <Text style={styles.bulletPoint}>• Try manually syncing by pulling down to refresh in the app</Text>
          <Text style={styles.bulletPoint}>• Restart the Syntra app and your wearable device</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Connection Issues?{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Check your internet connection (Wi-Fi or cellular data)</Text>
          <Text style={styles.bulletPoint}>• Ensure you're running the latest version of Syntra</Text>
          <Text style={styles.bulletPoint}>• Clear the app cache in your device settings</Text>
          <Text style={styles.bulletPoint}>• Try logging out and back in</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Can't Join Team?{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Verify you're entering the correct invite code</Text>
          <Text style={styles.bulletPoint}>• Make sure the invite code hasn't expired (check with your coach)</Text>
          <Text style={styles.bulletPoint}>• Confirm your coach has generated the invite code</Text>
          <Text style={styles.bulletPoint}>• Check that you're not already on another team (you can only be on one team at a time)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Notifications Not Working?{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Check notification permissions in your device settings</Text>
          <Text style={styles.bulletPoint}>• Verify notifications are enabled in Syntra settings</Text>
          <Text style={styles.bulletPoint}>• Make sure "Do Not Disturb" mode is not active</Text>
          <Text style={styles.bulletPoint}>• Check that Syntra is not in power-saving mode restrictions</Text>

          <Text style={styles.sectionTitle}>5. Device Compatibility</Text>
          <Text style={styles.paragraph}>
            Syntra is compatible with:
          </Text>
          <Text style={styles.bulletPoint}>• iOS 14.0 or later</Text>
          <Text style={styles.bulletPoint}>• Android 8.0 (Oreo) or later</Text>
          <Text style={styles.bulletPoint}>• Apple Watch (synced via Apple Health)</Text>
          <Text style={styles.bulletPoint}>• Garmin devices (via Garmin Connect)</Text>
          <Text style={styles.bulletPoint}>• Fitbit devices (via Fitbit app)</Text>
          <Text style={styles.bulletPoint}>• WHOOP, Oura Ring, and other major wearables</Text>

          <Text style={styles.sectionTitle}>6. Account Management</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Updating Your Profile{'\n'}</Text>
            Go to Settings → Profile to update your personal information, profile picture, and preferences.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Changing Your Password{'\n'}</Text>
            Navigate to Settings → Privacy & Security → Change Password to update your account credentials.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>Deleting Your Account{'\n'}</Text>
            If you need to delete your account, contact support. Note that this action is permanent and will remove all your health data from our servers.
          </Text>

          <Text style={styles.sectionTitle}>7. Privacy & Data Security</Text>
          <Text style={styles.paragraph}>
            Your health data is encrypted and secure. We never sell your personal information to third parties. For detailed information about how we protect your data, please review our Privacy & Security policy.
          </Text>
          <Text style={styles.paragraph}>
            You have complete control over your data, including the ability to export, modify, or delete it at any time.
          </Text>

          <Text style={styles.sectionTitle}>8. Best Practices</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>For Accurate Data{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Wear your device consistently, especially during sleep</Text>
          <Text style={styles.bulletPoint}>• Keep your wearable device charged and up to date</Text>
          <Text style={styles.bulletPoint}>• Sync your device regularly (at least once daily)</Text>
          <Text style={styles.bulletPoint}>• Ensure proper fit of your wearable for accurate heart rate readings</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.subheading}>For Coaches{'\n'}</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Review team health data regularly, especially before practice</Text>
          <Text style={styles.bulletPoint}>• Pay attention to trends, not just single data points</Text>
          <Text style={styles.bulletPoint}>• Communicate with players about their health status</Text>
          <Text style={styles.bulletPoint}>• Use data as one factor in decision-making, not the only factor</Text>

          <Text style={styles.sectionTitle}>9. Feedback & Feature Requests</Text>
          <Text style={styles.paragraph}>
            We're constantly improving Syntra based on user feedback. If you have suggestions for new features or improvements, we'd love to hear from you! Send your ideas to our support team.
          </Text>

          <Text style={styles.sectionTitle}>10. Emergency & Medical Concerns</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.importantText}>IMPORTANT:</Text> Syntra is not intended for medical diagnosis or emergency situations. If you or a player is experiencing a medical emergency, call emergency services immediately (911 in the US).
          </Text>
          <Text style={styles.paragraph}>
            For non-emergency medical concerns, always consult with a qualified healthcare professional. Syntra data should supplement, not replace, professional medical advice.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Support</Text>
          <Text style={styles.paragraph}>
            Still need help? Our support team is here to assist you:
          </Text>
          <Text style={styles.paragraph}>
            Email: buildteams@txconvergent.org
          </Text>
          <Text style={styles.paragraph}>
            When contacting support, please include:
          </Text>
          <Text style={styles.bulletPoint}>• Your account email</Text>
          <Text style={styles.bulletPoint}>• Device type and operating system version</Text>
          <Text style={styles.bulletPoint}>• A detailed description of the issue</Text>
          <Text style={styles.bulletPoint}>• Screenshots (if applicable)</Text>
          <Text style={styles.bulletPoint}>• Steps to reproduce the problem</Text>

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              We're committed to providing you with the best possible experience. Thank you for using Syntra!
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
  introText: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  subheading: {
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
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
  importantText: {
    fontWeight: Typography.fontWeight.bold as any,
    color: SemanticColors.error,
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
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

export default function HealthDataScreen() {
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
          <Text style={styles.navTitle}>Health Data</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.introText}>
            Syntra collects and processes health data to provide comprehensive monitoring and insights for coaches and trainers. Here's what you need to know about your health data.
          </Text>
          
          <Text style={styles.sectionTitle}>1. What Data We Collect</Text>
          <Text style={styles.paragraph}>
            Syntra collects various types of health and fitness data from connected devices and manual inputs, including:
          </Text>
          <Text style={styles.bulletPoint}>• Heart rate and heart rate variability (HRV)</Text>
          <Text style={styles.bulletPoint}>• Sleep duration, quality, and sleep stages</Text>
          <Text style={styles.bulletPoint}>• Activity levels and step counts</Text>
          <Text style={styles.bulletPoint}>• Workout sessions and exercise intensity</Text>
          <Text style={styles.bulletPoint}>• Recovery metrics and readiness scores</Text>
          <Text style={styles.bulletPoint}>• Body measurements and composition data</Text>
          <Text style={styles.bulletPoint}>• Training load and fatigue indicators</Text>

          <Text style={styles.sectionTitle}>2. Data Sources</Text>
          <Text style={styles.paragraph}>
            Health data in Syntra comes from multiple sources:
          </Text>
          <Text style={styles.bulletPoint}>• Wearable devices (smartwatches, fitness trackers)</Text>
          <Text style={styles.bulletPoint}>• Health apps integrated with Syntra</Text>
          <Text style={styles.bulletPoint}>• Manual entries by players or coaches</Text>
          <Text style={styles.bulletPoint}>• Team monitoring equipment</Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
          <Text style={styles.paragraph}>
            Your health data is used exclusively for the following purposes:
          </Text>
          <Text style={styles.bulletPoint}>• Displaying real-time health status and metrics</Text>
          <Text style={styles.bulletPoint}>• Generating insights and trends for performance optimization</Text>
          <Text style={styles.bulletPoint}>• Creating aggregated team dashboards for coaches</Text>
          <Text style={styles.bulletPoint}>• Identifying potential health concerns or recovery needs</Text>
          <Text style={styles.bulletPoint}>• Improving the Syntra application and user experience</Text>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We take the security of your health data seriously:
          </Text>
          <Text style={styles.bulletPoint}>• All data is encrypted in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Access controls ensure only authorized users can view data</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
          <Text style={styles.bulletPoint}>• Compliance with healthcare data protection standards</Text>

          <Text style={styles.sectionTitle}>5. Data Sharing</Text>
          <Text style={styles.paragraph}>
            Your health data visibility is controlled as follows:
          </Text>
          <Text style={styles.bulletPoint}>• Coaches and trainers can view data for their assigned players</Text>
          <Text style={styles.bulletPoint}>• Team aggregated data may be visible to authorized team staff</Text>
          <Text style={styles.bulletPoint}>• We never sell your personal health data to third parties</Text>
          <Text style={styles.bulletPoint}>• Data sharing requires your explicit consent</Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            Health data is retained to provide historical trends and insights:
          </Text>
          <Text style={styles.bulletPoint}>• Active user data is retained indefinitely while your account is active</Text>
          <Text style={styles.bulletPoint}>• Data may be retained for up to 90 days after account deletion</Text>
          <Text style={styles.bulletPoint}>• You can request complete data deletion at any time</Text>

          <Text style={styles.sectionTitle}>7. Your Data Rights</Text>
          <Text style={styles.paragraph}>
            You have complete control over your health data:
          </Text>
          <Text style={styles.bulletPoint}>• Access and download your complete health data at any time</Text>
          <Text style={styles.bulletPoint}>• Correct or update inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Delete specific data points or your entire dataset</Text>
          <Text style={styles.bulletPoint}>• Control who can view your data</Text>
          <Text style={styles.bulletPoint}>• Disconnect data sources at any time</Text>

          <Text style={styles.sectionTitle}>8. Data Accuracy</Text>
          <Text style={styles.paragraph}>
            While we strive for accuracy, please note:
          </Text>
          <Text style={styles.bulletPoint}>• Data accuracy depends on the quality of source devices</Text>
          <Text style={styles.bulletPoint}>• Wearable devices have inherent limitations and variability</Text>
          <Text style={styles.bulletPoint}>• Manual entries should be verified for accuracy</Text>
          <Text style={styles.bulletPoint}>• Syntra data should not be used for medical diagnosis</Text>

          {/* <Text style={styles.sectionTitle}>9. Contact for Data Requests</Text>
          <Text style={styles.paragraph}>
            For any questions or requests regarding your health data, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Email: privacy@convergent.health{'\n'}
            Website: www.convergent.health
          </Text> */}

          <View style={styles.acknowledgment}>
            <Text style={styles.acknowledgmentText}>
              Your health data is valuable and personal. We are committed to protecting it and using it only to help you and your team perform at your best.
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
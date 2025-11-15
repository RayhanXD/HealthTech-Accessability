import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';

export default function AthleteDashboardScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar - Empty to maintain spacing */}
      <View style={styles.statusBar} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonNav}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.7071 3.29289C16.3166 2.90237 15.6834 2.90237 15.2929 3.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L15.2929 20.7071C15.6834 21.0976 16.3166 21.0976 16.7071 20.7071C17.0976 20.3166 17.0976 19.6834 16.7071 19.2929L9.41421 12L16.7071 4.70711C17.0976 4.31658 17.0976 3.68342 16.7071 3.29289Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Athlete Dashboard</Text>
        <View style={styles.navIcons}>
          <Text style={styles.iconEmoji}>📊</Text>
          <Text style={styles.iconEmoji}>⚙️</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Overall Health Score */}
        <View style={styles.healthScoreSection}>
          <Text style={styles.healthScoreTitle}>Overall Health Score (AHS)</Text>
          <View style={styles.circleContainer}>
            <Svg width={196} height={196} viewBox="0 0 196 196" fill="none">
              {/* Outer ring */}
              <Path
                d="M196 98C196 152.124 152.124 196 98 196C43.8761 196 0 152.124 0 98C0 43.8761 43.8761 0 98 0C152.124 0 196 43.8761 196 98ZM14.7 98C14.7 144.005 51.9947 181.3 98 181.3C144.005 181.3 181.3 144.005 181.3 98C181.3 51.9947 144.005 14.7 98 14.7C51.9947 14.7 14.7 51.9947 14.7 98Z"
                fill="white"
              />
              {/* Progress arc - simplified for React Native */}
              <Path
                d="M98 0C123.991 3.09942e-07 148.918 10.325 167.296 28.7035C185.675 47.0821 196 72.0088 196 98L181.3 98C181.3 75.9074 172.524 54.7198 156.902 39.098C141.28 23.4762 120.093 14.7 98 14.7V0Z"
                fill="#40BF80"
              />
            </Svg>
            <View style={styles.circleTextContainer}>
              <Text style={styles.circleText}>xx%</Text>
            </View>
          </View>
        </View>

        {/* Progress Trend */}
        <View style={styles.progressTrendSection}>
          <View style={styles.progressTrendCard}>
            <Text style={styles.progressTrendTitle}>Progress Trend</Text>
            <Text style={styles.progressTrendSubtitle}>Metrics</Text>
            <View style={styles.chartContainer}>
              <Svg width="100%" height={160} viewBox="0 0 397 161" preserveAspectRatio="xMidYMid meet">
                <Path d="M0 0.5H397" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 40.5H397" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 80.5H397" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 120.5H397" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 160.5H397" stroke="white" />
                <Path
                  d="M79.2941 43.0895C46.4199 21.1785 18.9048 19.5005 18.9048 19.5005V160.5H378.095V62.4633C352.259 62.4633 338.395 28.0005 318.964 29.6351C299.533 31.2697 279.16 72.5005 257.946 76.9941C236.731 81.4876 223.076 57.5005 198.815 62.4633C174.553 67.4262 163.841 129.5 138.425 127.672C113.009 125.844 112.168 65.0005 79.2941 43.0895Z"
                  fill="url(#paint0_linear)"
                />
                <Path
                  d="M18.9048 19.5C18.9048 19.5 46.4199 21.178 79.2941 43.089C112.168 65 113.009 125.844 138.425 127.672C163.841 129.5 174.553 67.4257 198.815 62.4629C223.076 57.5 236.731 81.4872 257.946 76.9936C279.16 72.5 299.533 31.2692 318.964 29.6346C338.395 28 352.259 62.4629 378.095 62.4629"
                  stroke="white"
                />
                <Defs>
                  <LinearGradient
                    id="paint0_linear"
                    x1="201.651"
                    y1="160.501"
                    x2="201.651"
                    y2="19.501"
                    gradientUnits="userSpaceOnUse">
                    <Stop stopOpacity="0" />
                    <Stop offset="1" stopColor="white" />
                  </LinearGradient>
                </Defs>
              </Svg>
            </View>
            <Text style={styles.daysLabel}>Days</Text>
          </View>
        </View>

        {/* Metrics Overview */}
        <View style={styles.metricsSection}>
          <Text style={styles.metricsTitle}>Metrics Overview</Text>

          <View style={styles.metricsGrid}>
            {/* Readiness & Recovery */}
            <MetricCard
              zoneColor="#40BF80"
              zoneLabel="Green Zone"
              value="xx%"
              title="Readiness & Recovery"
              status="Looking Good"
            />

            {/* Sleep */}
            <MetricCard
              zoneColor="#D2DB70"
              zoneLabel="Yellow Zone"
              value="xx%"
              title="Sleep"
              status="Looking Good"
            />

            {/* Activity */}
            <MetricCard
              zoneColor="#E44F4F"
              zoneLabel="Green Zone"
              value="xx%"
              title="Activity"
              status="Looking Good"
            />

            {/* Well-being / Context */}
            <MetricCard
              zoneColor="#40BF80"
              zoneLabel="Green Zone"
              value="xx%"
              title="Well-being / Context"
              status="Looking Good"
            />
          </View>
        </View>

        {/* Missing Overnight Data */}
        <View style={styles.missingDataSection}>
          <View style={styles.missingDataHeader}>
            <Image
              source={{
                uri: 'https://api.builder.io/api/v1/image/assets/TEMP/9e94ef2d8caf829c6ccb815a7f21d61a25c15ee9?width=52',
              }}
              style={styles.priorityIcon}
              contentFit="contain"
            />
            <Text style={styles.missingDataTitle}>Missing Overnight Data</Text>
          </View>
          <View style={styles.missingDataContent}>
            <Text style={styles.dataEntryTitle}>Overnight Data Entry</Text>
            <View style={styles.dataEntryDropdown}>
              <Text style={styles.dataEntryPlaceholder}>Select your entry</Text>
            </View>
            <Text style={styles.dataEntryHint}>
              Wore device, Forgot device, Manual entry
            </Text>
          </View>
        </View>
          </ScrollView>
        </SafeAreaView>
  );
}

interface MetricCardProps {
  zoneColor: string;
  zoneLabel: string;
  value: string;
  title: string;
  status: string;
}

function MetricCard({
  zoneColor,
  zoneLabel,
  value,
  title,
  status,
}: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.zoneBadge, { backgroundColor: zoneColor }]}>
        <Text style={styles.zoneBadgeText}>{zoneLabel}</Text>
      </View>
      <View style={styles.metricCardContent}>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <View style={styles.metricCardFooter}>
        <Text style={styles.metricCardTitle}>{title}</Text>
        <Text style={styles.metricCardStatus}>{status}</Text>
      </View>
    </View>
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
  navBar: {
    backgroundColor: BrandColors.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonNav: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    color: BrandColors.white,
    fontSize: 20,
    fontWeight: '500',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconEmoji: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  healthScoreSection: {
    paddingHorizontal: 12,
    paddingVertical: 32,
  },
  healthScoreTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  circleContainer: {
    width: 196,
    height: 196,
    alignSelf: 'center',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTextContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: BrandColors.white,
    fontSize: 48,
    fontWeight: '500',
  },
  progressTrendSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  progressTrendCard: {
    borderWidth: 1,
    borderColor: BrandColors.white,
    borderRadius: 6,
    padding: 12,
  },
  progressTrendTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 4,
  },
  progressTrendSubtitle: {
    fontSize: 12,
    color: BrandColors.white,
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    height: 160,
    marginBottom: 4,
  },
  daysLabel: {
    fontSize: 14,
    color: BrandColors.white,
    textAlign: 'right',
    marginTop: 4,
  },
  metricsSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: BrandColors.white,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  zoneBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderBottomRightRadius: 6,
    zIndex: 1,
  },
  zoneBadgeText: {
    color: BrandColors.black,
    fontSize: 12,
    fontWeight: '500',
  },
  metricCardContent: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: BrandColors.purple,
    fontSize: 48,
    fontWeight: '500',
  },
  metricCardFooter: {
    backgroundColor: BrandColors.black,
    paddingVertical: 16,
  },
  metricCardTitle: {
    color: BrandColors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  metricCardStatus: {
    color: BrandColors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  missingDataSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  missingDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityIcon: {
    width: 26,
    height: 20,
  },
  missingDataTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.white,
  },
  missingDataContent: {
    paddingHorizontal: 12,
  },
  dataEntryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 4,
  },
  dataEntryDropdown: {
    borderWidth: 1,
    borderColor: BrandColors.white,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  dataEntryPlaceholder: {
    fontSize: 14,
    color: BrandColors.white,
  },
  dataEntryHint: {
      fontSize: 12,
      color: BrandColors.white,
    },
  });

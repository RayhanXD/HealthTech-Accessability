import React, { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import SettingsModal from './settings-modal';
import { useSahha } from '@/lib/sahha/useSahha';

export default function AthleteDashboardScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const router = useRouter();
  const iconAnim = useRef(new Animated.Value(0)).current; // 0 = hamburger, 1 = X

  // Animate icon when settings modal opens/closes
  useEffect(() => {
    if (settingsVisible) {
      Animated.timing(iconAnim, {
        toValue: 1, // Animate to X
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(iconAnim, {
        toValue: 0, // Animate back to hamburger
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [settingsVisible]);

  // Get playerId from AsyncStorage or API
  useEffect(() => {
    const loadPlayerId = async () => {
      try {
        // Try to get playerId from AsyncStorage
        const storedPlayerId = await AsyncStorage.getItem('playerId');
        if (storedPlayerId) {
          setPlayerId(storedPlayerId);
        } else {
          // TODO: Fetch playerId from your API after user login
          // Example: const response = await fetch('/api/user/me');
          // const user = await response.json();
          // setPlayerId(user.id);
          console.log('⚠️ PlayerId not found. Sahha will not initialize until playerId is available.');
        }
      } catch (error) {
        console.error('Error loading playerId:', error);
      }
    };
    loadPlayerId();
  }, []);

  // Initialize Sahha when playerId is available
  const { isInitialized, isLoading, error: sahhaError } = useSahha({
    playerId: playerId || undefined,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    autoInitialize: !!playerId,
  });

  const handleBack = () => {
    router.back();
  };

  // Line chart data for progress trend
  const lineChartData = {
    labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Progress'],
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height dynamically
  // For iOS: detect notched devices (iPhone X and later) vs older devices
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12 // 44px for notched devices (X, 11, 12, 13, 14, 15, etc.), 20px for older, plus 12px extra
    : (StatusBar.currentHeight || 0) + 12;

  return (
    <LinearGradient
      colors={[SemanticColors.background, SemanticColors.background, '#4C1D95']}
      locations={[0, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Dynamic top spacing to prevent status bar overlap */}
        <View style={{ height: statusBarHeight }} />
        
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <View style={styles.navIcons}>
            <TouchableOpacity
              onPress={() => setSettingsVisible(!settingsVisible)}
              style={styles.iconButton}
              activeOpacity={0.7}>
              <View style={styles.iconContainer}>
                {/* Hamburger icon */}
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      opacity: iconAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                      transform: [
                        {
                          rotate: iconAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '90deg'],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 12H21M3 6H21M3 18H21"
                      stroke={BrandColors.white}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Animated.View>
                {/* X icon */}
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      position: 'absolute',
                      opacity: iconAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [
                        {
                          rotate: iconAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['-90deg', '0deg'],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z"
                      fill={BrandColors.white}
                    />
                  </Svg>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.navTitle}>Welcome, Athlete</Text>
          <View style={styles.navIcons} />
        </View>

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
                fill={BrandColors.purple}
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
              <LineChart
                data={lineChartData}
                width={screenWidth - 72}
                height={180}
                chartConfig={{
                  backgroundColor: BrandColors.black,
                  backgroundGradientFrom: BrandColors.black,
                  backgroundGradientTo: BrandColors.black,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 6,
                  },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: BrandColors.purple,
                    fill: BrandColors.purple,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '3 3',
                    stroke: BrandColors.white,
                    strokeOpacity: 0.5,
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 6,
                }}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
              />
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
    </LinearGradient>
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
  },
  navBar: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButtonNav: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    color: SemanticColors.primary,
    fontSize: 32,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'center',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  iconContainer: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  healthScoreSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing['4xl'],
    marginBottom: Spacing.sm,
  },
  healthScoreTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    textAlign: 'center',
    marginBottom: Spacing['4xl'],
  },
  circleContainer: {
    width: 196,
    height: 196,
    alignSelf: 'center',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  circleTextContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: SemanticColors.textPrimary,
    fontSize: 48,
    fontWeight: Typography.fontWeight.medium as any,
  },
  progressTrendSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  progressTrendCard: {
    backgroundColor: SemanticColors.background,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  progressTrendTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: 6,
  },
  progressTrendSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    width: '100%',
    height: 180,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  daysLabel: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  metricsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: SemanticColors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 0,
  },
  zoneBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderBottomRightRadius: BorderRadius.sm,
    zIndex: 1,
  },
  zoneBadgeText: {
    color: SemanticColors.textOnSurface,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  metricCardContent: {
    paddingTop: 36,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: SemanticColors.primary,
    fontSize: 48,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  metricCardFooter: {
    backgroundColor: SemanticColors.background,
    paddingVertical: 18,
    paddingHorizontal: Spacing.md,
  },
  metricCardTitle: {
    color: SemanticColors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'center',
    marginBottom: 6,
  },
  metricCardStatus: {
    color: SemanticColors.textSecondary,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  missingDataSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  missingDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  missingDataTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  missingDataContent: {
    paddingHorizontal: Spacing.xs,
  },
  dataEntryTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium as any,
    color: SemanticColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  dataEntryDropdown: {
    backgroundColor: SemanticColors.background,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: 6,
  },
  dataEntryPlaceholder: {
    fontSize: Typography.fontSize.md,
    color: SemanticColors.textTertiary,
  },
  dataEntryHint: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
  },
});

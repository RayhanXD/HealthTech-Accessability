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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { LineChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import SettingsModal from './settings-modal';
import { useSahha } from '@/lib/sahha/useSahha';
import PatternOverlay from './pattern-overlay';

export default function AthleteDashboardScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [healthScoreDetailVisible, setHealthScoreDetailVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const router = useRouter();
  const iconAnim = useRef(new Animated.Value(0)).current; // 0 = hamburger, 1 = X
  
  const handleShare = (method: 'coach' | 'trainer' | 'export') => {
    setShareModalVisible(false);
    // TODO: Implement actual share functionality
    // For now, just log the action
    console.log(`Sharing via ${method}`);
    // In a real implementation, you would:
    // - Send data to coach/trainer via API
    // - Use Share API to share progress
    // - Generate and export PDF/CSV
  };
  
  // Animation values for card appearances
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Animate cards on mount
  useEffect(() => {
    Animated.stagger(100, cardAnimations.map(anim => 
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      })
    )).start();
  }, []);
  
  // Mock data - replace with real data
  const healthScore = 78;
  const healthScoreTrend = 5; // +5% from last week
  const recoveryDaysEstimate = 5;
  const lastUpdated = '2 hours ago';
  const healthStatus = healthScore >= 80 ? 'good' : healthScore >= 60 ? 'caution' : 'atRisk';
  
  // Critical health metrics data
  const healthMetrics = {
    restingHeartRate: { value: 62, unit: 'bpm', trend: -3, status: 'good' },
    heartRateVariability: { value: 45, unit: 'ms', trend: 5, status: 'good' },
    sleepQuality: { hours: 7.5, qualityScore: 82, trend: 8, status: 'good' },
    activityLevel: { steps: 8420, activeMinutes: 45, trend: 12, status: 'good' },
    heartRateRecovery: { value: 25, unit: 'bpm', trend: -2, status: 'caution' },
  };
  
  // Alerts and notifications data
  const alerts = [
    {
      id: 1,
      type: 'warning' as const,
      message: 'Heart rate recovery is slower than baseline',
      recommendation: 'Consider reducing activity intensity today',
    },
    {
      id: 2,
      type: 'info' as const,
      message: 'Sleep quality improved 8% this week',
      recommendation: 'Great progress! Keep maintaining your sleep schedule',
    },
  ];
  
  const returnToPlayStatus = {
    status: 'caution' as const, // 'ready', 'caution', 'notReady'
    message: 'Estimated 5 days until return to play',
    details: 'Continue light activity, avoid contact sports',
  };

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
  const lineChartData = [
    { value: 20, label: 'D1' },
    { value: 45, label: 'D2' },
    { value: 28, label: 'D3' },
    { value: 80, label: 'D4' },
    { value: 99, label: 'D5' },
    { value: 43, label: 'D6' },
    { value: 50, label: 'D7' },
  ];

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height dynamically
  // For iOS: detect notched devices (iPhone X and later) vs older devices
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12 // 44px for notched devices (X, 11, 12, 13, 14, 15, etc.), 20px for older, plus 12px extra
    : (StatusBar.currentHeight || 0) + 12;

  return (
    <View style={styles.container}>
      <PatternOverlay patternType="graph" opacity={0.3} />
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
          <View style={styles.healthScoreHeader}>
            <Text style={styles.healthScoreTitle}>Overall Health Score (AHS)</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendArrow}>↑</Text>
              <Text style={styles.trendText}>+{healthScoreTrend}%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.healthScoreCard}
            onPress={() => setHealthScoreDetailVisible(true)}
            activeOpacity={0.8}>
            <View style={styles.circleContainer}>
              <Svg width={180} height={180} viewBox="0 0 196 196" fill="none">
                {/* Outer circle background */}
                <Circle
                  cx="98"
                  cy="98"
                  r="90"
                  fill="transparent"
                  stroke={SemanticColors.borderMuted}
                  strokeWidth="4"
                />
                {/* Status ring - color coded full circle */}
                <Circle
                  cx="98"
                  cy="98"
                  r="90"
                  fill="transparent"
                  stroke={healthStatus === 'good' ? '#40BF80' : healthStatus === 'caution' ? '#D2DB70' : '#E44F4F'}
                  strokeWidth="6"
                />
                {/* Progress arc - calculated based on health score */}
                {(() => {
                  const percentage = healthScore / 100;
                  const angle = (percentage * 360 - 90) * (Math.PI / 180);
                  const x = 98 + 90 * Math.cos(angle);
                  const y = 98 + 90 * Math.sin(angle);
                  const largeArcFlag = percentage > 0.5 ? 1 : 0;
                  return (
                    <Path
                      d={`M 98 8 A 90 90 0 ${largeArcFlag} 1 ${x} ${y} L 98 98 Z`}
                      fill={BrandColors.purple}
                      opacity={0.3}
                    />
                  );
                })()}
              </Svg>
              <View style={styles.circleTextContainer}>
                <Text style={styles.circleText}>{healthScore}%</Text>
              </View>
            </View>
            <View style={styles.healthScoreInfo}>
              <View style={styles.recoveryTimeline}>
                <Text style={styles.recoveryLabel}>Estimated Recovery:</Text>
                <Text style={styles.recoveryDays}>{recoveryDaysEstimate} days</Text>
              </View>
              <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
            </View>
          </TouchableOpacity>
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
                spacing={40}
                thickness={3}
                color={BrandColors.purple}
                hideRules={false}
                hideYAxisText={false}
                yAxisColor={SemanticColors.borderMuted}
                xAxisColor={SemanticColors.borderMuted}
                rulesColor={SemanticColors.borderMuted}
                rulesType="solid"
                curved
                areaChart
                startFillColor={BrandColors.purple}
                endFillColor={BrandColors.purple}
                startOpacity={0.2}
                endOpacity={0.05}
                initialSpacing={0}
                noOfSections={4}
                maxValue={100}
                yAxisTextStyle={{
                  color: SemanticColors.textSecondary,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: SemanticColors.textSecondary,
                  fontSize: 10,
                }}
                dataPointsColor={BrandColors.purple}
                dataPointsRadius={5}
                textShiftY={-2}
                textShiftX={-5}
                textFontSize={10}
                textColor={SemanticColors.textSecondary}
                showVerticalLines
                verticalLinesColor={SemanticColors.borderMuted}
                verticalLinesThickness={0.5}
                showStripOnFingerPress
                stripColor={BrandColors.purple}
                stripOpacity={0.3}
                stripWidth={2}
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
              zoneColor={SemanticColors.zoneGreen}
              zoneLabel="Green Zone"
              value="85%"
              title="Readiness & Recovery"
              status="Looking Good"
            />

            {/* Sleep */}
            <MetricCard
              zoneColor={SemanticColors.zoneYellow}
              zoneLabel="Yellow Zone"
              value="72%"
              title="Sleep"
              status="Needs Improvement"
            />

            {/* Activity */}
            <MetricCard
              zoneColor={SemanticColors.zoneGreen}
              zoneLabel="Green Zone"
              value="90%"
              title="Activity"
              status="Looking Good"
            />

            {/* Well-being / Context */}
            <MetricCard
              zoneColor={SemanticColors.zoneGreen}
              zoneLabel="Green Zone"
              value="88%"
              title="Well-being / Context"
              status="Looking Good"
            />
          </View>
        </View>

        {/* Critical Health Metrics */}
        <View style={styles.criticalMetricsSection}>
          <Text style={styles.criticalMetricsTitle}>Critical Health Metrics</Text>
          
          <View style={styles.criticalMetricsGrid}>
            {/* Resting Heart Rate */}
            <HealthMetricCard
              title="Resting Heart Rate"
              value={healthMetrics.restingHeartRate.value}
              unit={healthMetrics.restingHeartRate.unit}
              trend={healthMetrics.restingHeartRate.trend}
              status={healthMetrics.restingHeartRate.status}
              iconName="heart"
              animationIndex={0}
            />
            
            {/* Heart Rate Variability */}
            <HealthMetricCard
              title="Heart Rate Variability"
              value={healthMetrics.heartRateVariability.value}
              unit={healthMetrics.heartRateVariability.unit}
              trend={healthMetrics.heartRateVariability.trend}
              status={healthMetrics.heartRateVariability.status}
              iconName="pulse"
              animationIndex={1}
            />
            
            {/* Sleep Quality */}
            <HealthMetricCard
              title="Sleep Quality"
              value={healthMetrics.sleepQuality.hours}
              unit="hrs"
              secondaryValue={healthMetrics.sleepQuality.qualityScore}
              secondaryUnit="score"
              trend={healthMetrics.sleepQuality.trend}
              status={healthMetrics.sleepQuality.status}
              iconName="moon"
              animationIndex={2}
            />
            
            {/* Activity Level */}
            <HealthMetricCard
              title="Activity Level"
              value={healthMetrics.activityLevel.steps}
              unit="steps"
              secondaryValue={healthMetrics.activityLevel.activeMinutes}
              secondaryUnit="min"
              trend={healthMetrics.activityLevel.trend}
              status={healthMetrics.activityLevel.status}
              iconName="walk"
              animationIndex={3}
            />
          </View>
          
          {/* Heart Rate Recovery - Centered */}
          <View style={styles.centeredMetricCard}>
            <HealthMetricCard
              title="Heart Rate Recovery"
              value={healthMetrics.heartRateRecovery.value}
              unit={healthMetrics.heartRateRecovery.unit}
              trend={healthMetrics.heartRateRecovery.trend}
              status={healthMetrics.heartRateRecovery.status}
              iconName="flash"
              isCentered={true}
              animationIndex={4}
            />
          </View>
        </View>

        {/* Alerts & Notifications */}
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>Alerts & Recommendations</Text>
          
          {/* Warning Banner */}
          {alerts.filter(a => a.type === 'warning').length > 0 && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color={SemanticColors.zoneRed} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Attention Required</Text>
                {alerts
                  .filter(a => a.type === 'warning')
                  .map((alert) => (
                    <View key={alert.id} style={styles.alertItem}>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <Text style={styles.alertRecommendation}>{alert.recommendation}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}
          
          {/* Recommendations Card */}
          {alerts.filter(a => a.type === 'info').length > 0 && (
            <View style={styles.recommendationsCard}>
              <View style={styles.recommendationsHeader}>
                <Ionicons name="information-circle" size={20} color={SemanticColors.primary} />
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
              </View>
              {alerts
                .filter(a => a.type === 'info')
                .map((alert) => (
                  <View key={alert.id} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>{alert.recommendation}</Text>
                  </View>
                ))}
            </View>
          )}
          
          {/* Return-to-Play Status */}
          <View style={styles.returnToPlayCard}>
            <View style={styles.returnToPlayHeader}>
              <Ionicons 
                name={returnToPlayStatus.status === 'ready' ? 'checkmark-circle' : returnToPlayStatus.status === 'caution' ? 'alert-circle' : 'close-circle'} 
                size={24} 
                color={
                  returnToPlayStatus.status === 'ready' 
                    ? SemanticColors.zoneGreen 
                    : returnToPlayStatus.status === 'caution' 
                    ? SemanticColors.zoneYellow 
                    : SemanticColors.zoneRed
                } 
              />
              <Text style={styles.returnToPlayTitle}>Return-to-Play Status</Text>
            </View>
            <Text style={styles.returnToPlayMessage}>{returnToPlayStatus.message}</Text>
            <Text style={styles.returnToPlayDetails}>{returnToPlayStatus.details}</Text>
          </View>
          
          {/* Share Progress Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShareModalVisible(true)}
            activeOpacity={0.7}>
            <Ionicons name="share-social" size={20} color={SemanticColors.textOnPrimary} />
            <Text style={styles.shareButtonText}>Share Progress</Text>
          </TouchableOpacity>
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
    </View>
  );
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (method: 'coach' | 'trainer' | 'export') => void;
}

function ShareModal({ visible, onClose, onShare }: ShareModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.shareModal}>
        <View style={styles.shareModalHeader}>
          <Text style={styles.shareModalTitle}>Share Progress</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={SemanticColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.shareModalDescription}>
          Share your recovery progress:
        </Text>
        <View style={styles.shareOptions}>
          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => onShare('coach')}
            activeOpacity={0.7}>
            <Ionicons name="people" size={24} color={SemanticColors.primary} />
            <View style={styles.shareOptionContent}>
              <Text style={styles.shareOptionTitle}>Share with Coach</Text>
              <Text style={styles.shareOptionDescription}>
                Send your progress to your coach
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => onShare('trainer')}
            activeOpacity={0.7}>
            <Ionicons name="medical" size={24} color={SemanticColors.primary} />
            <View style={styles.shareOptionContent}>
              <Text style={styles.shareOptionTitle}>Share with Trainer</Text>
              <Text style={styles.shareOptionDescription}>
                Send your progress to your trainer
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => onShare('export')}
            activeOpacity={0.7}>
            <Ionicons name="document-text" size={24} color={SemanticColors.primary} />
            <View style={styles.shareOptionContent}>
              <Text style={styles.shareOptionTitle}>Export Report</Text>
              <Text style={styles.shareOptionDescription}>
                Generate PDF report for medical professionals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

interface HealthMetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend: number;
  status: 'good' | 'caution' | 'atRisk';
  iconName: keyof typeof Ionicons.glyphMap;
  secondaryValue?: number;
  secondaryUnit?: string;
  isCentered?: boolean;
}

function HealthMetricCard({
  title,
  value,
  unit,
  trend,
  status,
  iconName,
  secondaryValue,
  secondaryUnit,
  isCentered = false,
  animationIndex = 0,
}: HealthMetricCardProps & { animationIndex?: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
        delay: animationIndex * 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: animationIndex * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return SemanticColors.zoneGreen;
      case 'caution':
        return SemanticColors.zoneYellow;
      case 'atRisk':
        return SemanticColors.zoneRed;
      default:
        return SemanticColors.borderMuted;
    }
  };

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'k';
    }
    return val.toString();
  };

  return (
    <Animated.View 
      style={[
        styles.healthMetricCard, 
        isCentered && styles.centeredHealthMetricCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}>
      <View style={styles.healthMetricHeader}>
        <Ionicons name={iconName} size={24} color={SemanticColors.primary} />
        <View style={[styles.healthMetricStatusDot, { backgroundColor: getStatusColor() }]} />
      </View>
      <View style={styles.healthMetricContent}>
        <Text style={styles.healthMetricTitle}>{title}</Text>
        <View style={styles.healthMetricValueRow}>
          <Text style={styles.healthMetricValue}>{formatValue(value)}</Text>
          <Text style={styles.healthMetricUnit}>{unit}</Text>
        </View>
        {secondaryValue !== undefined && (
          <View style={styles.healthMetricSecondaryRow}>
            <Text style={styles.healthMetricSecondaryValue}>{formatValue(secondaryValue)}</Text>
            <Text style={styles.healthMetricSecondaryUnit}>{secondaryUnit}</Text>
          </View>
        )}
        <View style={styles.healthMetricTrend}>
          <Text style={[styles.healthMetricTrendArrow, trend >= 0 ? styles.trendPositive : styles.trendNegative]}>
            {trend >= 0 ? '↑' : '↓'}
          </Text>
          <Text style={[styles.healthMetricTrendText, trend >= 0 ? styles.trendPositive : styles.trendNegative]}>
            {Math.abs(trend)}{(unit === 'bpm' || unit === 'ms') ? ` ${unit}` : '%'} from last week
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SemanticColors.background,
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
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  healthScoreTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SemanticColors.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  trendArrow: {
    fontSize: 14,
    color: SemanticColors.success,
    fontWeight: Typography.fontWeight.bold as any,
  },
  trendText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.success,
    fontWeight: Typography.fontWeight.medium as any,
  },
  healthScoreCard: {
    alignItems: 'center',
  },
  circleContainer: {
    width: 180,
    height: 180,
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
  healthScoreInfo: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recoveryTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  recoveryLabel: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
  },
  recoveryDays: {
    fontSize: Typography.fontSize.lg,
    color: SemanticColors.primary,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
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
  criticalMetricsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  criticalMetricsTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.lg,
  },
  criticalMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  centeredMetricCard: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    width: '100%',
  },
  centeredHealthMetricCard: {
    width: '48%',
    alignSelf: 'center',
  },
  healthMetricCard: {
    width: '48%',
    backgroundColor: SemanticColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    marginBottom: Spacing.md,
  },
  healthMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  healthMetricStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  healthMetricContent: {
    gap: Spacing.xs,
  },
  healthMetricTitle: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  healthMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  healthMetricValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  healthMetricUnit: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
  },
  healthMetricSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  healthMetricSecondaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    color: SemanticColors.textPrimary,
  },
  healthMetricSecondaryUnit: {
    fontSize: Typography.fontSize.xs,
    color: SemanticColors.textTertiary,
  },
  healthMetricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  healthMetricTrendArrow: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold as any,
  },
  healthMetricTrendText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium as any,
  },
  trendPositive: {
    color: SemanticColors.success,
  },
  trendNegative: {
    color: SemanticColors.error,
  },
  alertsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  alertsTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(228, 79, 79, 0.1)',
    borderWidth: 1,
    borderColor: SemanticColors.zoneRed,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  warningContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  warningTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.zoneRed,
    marginBottom: Spacing.xs,
  },
  alertItem: {
    marginBottom: Spacing.sm,
  },
  alertMessage: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  alertRecommendation: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    fontStyle: 'italic',
  },
  recommendationsCard: {
    backgroundColor: SemanticColors.background,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  recommendationsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  recommendationItem: {
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    lineHeight: 20,
  },
  returnToPlayCard: {
    backgroundColor: SemanticColors.background,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  returnToPlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  returnToPlayTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  returnToPlayMessage: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: Spacing.xs,
  },
  returnToPlayDetails: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: SemanticColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  shareButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textOnPrimary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  shareModal: {
    backgroundColor: SemanticColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  shareModalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  shareModalDescription: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  shareOptions: {
    gap: Spacing.md,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: SemanticColors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    gap: Spacing.md,
  },
  shareOptionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  shareOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textPrimary,
  },
  shareOptionDescription: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
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

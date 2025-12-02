import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import SettingsModal from './settings-modal';

type FilterStatus = 'all' | 'healthy' | 'injured' | 'suspended';

interface Athlete {
  id: number;
  name: string;
  status: string;
}

const athletes: Athlete[] = [
  { id: 1, name: 'Name 1', status: 'Healthy' },
  { id: 2, name: 'Name 2', status: 'Injured' },
  { id: 3, name: 'Name 3', status: 'Suspended' },
  { id: 4, name: 'Name 4', status: 'Healthy' },
  { id: 5, name: 'Name 5', status: 'Healthy' },
  { id: 6, name: 'Name 6', status: 'Healthy' },
  { id: 7, name: 'Name 7', status: 'Injured' },
  { id: 8, name: 'Name 8', status: 'Healthy' },
  { id: 9, name: 'Name 9', status: 'Healthy' },
  { id: 10, name: 'Name 10', status: 'Healthy' },
];

export default function CoachDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [settingsVisible, setSettingsVisible] = useState(false);
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

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || athlete.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate pie chart data from athletes
  const pieChartData = useMemo(() => {
    const statusCounts = athletes.reduce((acc, athlete) => {
      const status = athlete.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      {
        name: 'Healthy',
        population: statusCounts.healthy || 0,
        color: '#8CD47E',
        legendFontColor: BrandColors.white,
        legendFontSize: 12,
      },
      {
        name: 'Injured',
        population: statusCounts.injured || 0,
        color: '#FF6961',
        legendFontColor: BrandColors.white,
        legendFontSize: 12,
      },
      {
        name: 'Suspended',
        population: statusCounts.suspended || 0,
        color: '#F8D66D',
        legendFontColor: BrandColors.white,
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0);
  }, []);

  // Bar chart data
  const barChartData = {
    labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
    datasets: [
      {
        data: [82, 59, 10, 61, 48, 73, 54],
      },
    ],
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate status bar height dynamically
  // For iOS: detect notched devices (iPhone X and later) vs older devices
  const statusBarHeight = Platform.OS === 'ios' 
    ? (screenHeight >= 812 ? 44 : 20) + 12 // 44px for notched devices (X, 11, 12, 13, 14, 15, etc.), 20px for older, plus 12px extra
    : (StatusBar.currentHeight || 0) + 12;

  const handleBack = () => {
    router.back();
  };

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
          <Text style={styles.navTitle}>Welcome, Coach</Text>
          <View style={styles.navIcons} />
        </View>

        {/* Team Analytics */}
        <View style={styles.teamAnalyticsSection}>
          <Text style={styles.sectionTitle}>Team Analytics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Total Athletes</Text>
              <Text style={styles.analyticsValue}>10</Text>
              <Text style={styles.analyticsChange}>+2</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Avg. Performance</Text>
              <Text style={styles.analyticsValue}>75%</Text>
              <Text style={styles.analyticsChange}>+5%</Text>
            </View>
          </View>
        </View>

        {/* Athlete Status Distribution */}
        <View style={styles.distributionSection}>
          <View style={styles.distributionCard}>
            <Text style={styles.distributionTitle}>Athlete Status Distribution</Text>
            <Text style={styles.distributionSubtitle}>Count</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 72}
                height={200}
                chartConfig={{
                  backgroundColor: BrandColors.black,
                  backgroundGradientFrom: BrandColors.black,
                  backgroundGradientTo: BrandColors.black,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            <Text style={styles.distributionLabel}>Status</Text>
          </View>
        </View>

        {/* Team Performance Metrics */}
        <View style={styles.performanceSection}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>Team Performance Metrics</Text>
            <Text style={styles.performanceSubtitle}>Scores</Text>
            <View style={styles.barChartContainer}>
              <BarChart
                data={barChartData}
                width={screenWidth - 72}
                height={180}
                chartConfig={{
                  backgroundColor: BrandColors.black,
                  backgroundGradientFrom: BrandColors.black,
                  backgroundGradientTo: BrandColors.black,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  fillShadowGradient: BrandColors.purple,
                  fillShadowGradientOpacity: 0.8,
                  style: {
                    borderRadius: 6,
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
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={false}
                style={{
                  marginVertical: 8,
                  borderRadius: 6,
                }}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </View>
            <Text style={styles.performanceLabel}>Metrics</Text>
          </View>
        </View>

        {/* Search Athletes */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Search Athletes</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name..."
              placeholderTextColor={BrandColors.white}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.searchHint}>You can filter by first or last name</Text>
        </View>

        {/* Filter Athletes */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter Athletes</Text>
          <View style={styles.filterButtons}>
            <FilterButton
              label="All"
              isSelected={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
            />
            <FilterButton
              label="Healthy"
              isSelected={filterStatus === 'healthy'}
              onPress={() => setFilterStatus('healthy')}
            />
            <FilterButton
              label="Injured"
              isSelected={filterStatus === 'injured'}
              onPress={() => setFilterStatus('injured')}
            />
            <FilterButton
              label="Suspended"
              isSelected={filterStatus === 'suspended'}
              onPress={() => setFilterStatus('suspended')}
            />
          </View>
          <Text style={styles.filterHint}>Select athlete status to filter</Text>
        </View>

        {/* Athlete Roster */}
        <View style={styles.rosterSection}>
          <Text style={styles.rosterTitle}>Athlete Roster</Text>
          <View style={styles.rosterList}>
            {filteredAthletes.map((athlete) => (
              <AthleteRow key={athlete.id} athlete={athlete} />
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function FilterButton({ label, isSelected, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.filterButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

interface AthleteRowProps {
  athlete: Athlete;
}

function AthleteRow({ athlete }: AthleteRowProps) {
  return (
    <View style={styles.athleteRow}>
      <Image
        source={{
          uri: 'https://api.builder.io/api/v1/image/assets/TEMP/a03a045d12504f2f31d8c20dabf00706eb0a0772?width=54',
        }}
        style={styles.athleteAvatar}
        contentFit="cover"
      />
      <View style={styles.athleteInfo}>
        <Text style={styles.athleteName}>{athlete.name}</Text>
        <Text style={styles.athleteStatus}>Status: {athlete.status}</Text>
      </View>
      <TouchableOpacity style={styles.viewAnalyticsButton} activeOpacity={0.7}>
        <Text style={styles.viewAnalyticsText}>View Analytics</Text>
        <Image
          source={{
            uri: 'https://api.builder.io/api/v1/image/assets/TEMP/8ea281e31dab7273b02f1758129a94e3a56abf37?width=64',
          }}
          style={styles.arrowIcon}
          contentFit="contain"
        />
      </TouchableOpacity>
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
    color: SemanticColors.textPrimary,
    fontSize: 32,
    fontWeight: Typography.fontWeight.semibold as any,
    textAlign: 'left',
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
  teamAnalyticsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.lg,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    minHeight: 100,
  },
  analyticsLabel: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.xs,
  },
  analyticsChange: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.success,
    fontWeight: Typography.fontWeight.medium as any,
  },
  distributionSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  distributionCard: {
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  distributionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: 6,
  },
  distributionSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    overflow: 'hidden',
  },
  distributionLabel: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  performanceSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  performanceCard: {
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  performanceTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: 6,
  },
  performanceSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  barChartContainer: {
    borderWidth: 1,
    borderColor: SemanticColors.borderSecondary,
    borderRadius: BorderRadius.md,
    height: 180,
    position: 'relative',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  performanceLabel: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  searchTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: 6,
  },
  searchInput: {
    color: SemanticColors.textPrimary,
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  searchHint: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
    marginTop: Spacing.xs,
  },
  filterSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  filterTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: SemanticColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
  },
  filterButtonSelected: {
    backgroundColor: SemanticColors.primary,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.md,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
  },
  filterHint: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
  },
  rosterSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  rosterTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.xl,
  },
  rosterList: {
    gap: 0,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  athleteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  athleteInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  athleteName: {
    fontSize: 15,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
    marginBottom: 2,
  },
  athleteStatus: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
  },
  viewAnalyticsButton: {
    backgroundColor: SemanticColors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAnalyticsText: {
    color: SemanticColors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  arrowIcon: {
    width: 32,
    height: 19,
  },
});

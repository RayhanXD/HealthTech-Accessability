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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import SettingsModal from './settings-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trainerAPI } from '@/lib/api/api';

type FilterStatus = 'all' | 'healthy' | 'injured' | 'suspended';

interface Athlete {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  lastSync: string; // e.g., "2 hours ago", "Just now"
}

type SortOption = 'name' | 'status' | 'healthScore';

export default function CoachDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const router = useRouter();
  const iconAnim = useRef(new Animated.Value(0)).current; // 0 = hamburger, 1 = X
  const scrollViewRef = useRef<ScrollView>(null);
  const filterSectionY = useRef<number>(0);

  // Real data state
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teamStatistics, setTeamStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch players with health data
  useEffect(() => {
    const fetchPlayersData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await trainerAPI.getMyPlayersWithHealth();
        
        setAthletes(data.players || []);
        setTeamStatistics(data.teamStatistics || null);
      } catch (err: any) {
        console.error('Error fetching players data:', err);
        setError(err.message || 'Failed to load team data');
        // Set empty defaults
        setAthletes([]);
        setTeamStatistics({
          totalAthletes: 0,
          avgPerformance: 0,
          atRiskCount: 0,
          teamAverage: 0,
          previousAverage: null,
          averageChange: 0,
          barChartData: [],
          statusDistribution: {
            healthy: 0,
            injured: 0,
            suspended: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersData();
  }, []);
  
  const handleExport = (format: 'pdf' | 'csv' | 'share') => {
    setExportModalVisible(false);
    // TODO: Implement actual export functionality
    // For now, just log the action
    console.log(`Exporting as ${format}`);
    // In a real implementation, you would:
    // - Generate PDF using a library like react-native-pdf or react-native-html-to-pdf
    // - Generate CSV from athlete data
    // - Use Share API to share data
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


  // Calculate pie chart data from athletes
  const pieChartData = useMemo(() => {
    if (!teamStatistics) {
      return [];
    }

    return [
      {
        value: teamStatistics.statusDistribution?.healthy || 0,
        color: BrandColors.purple, // Light purple
        text: 'Healthy',
      },
      {
        value: teamStatistics.statusDistribution?.injured || 0,
        color: BrandColors.purpleDark, // Darker purple
        text: 'Injured',
      },
      {
        value: teamStatistics.statusDistribution?.suspended || 0,
        color: '#6B6B6B', // Medium gray
        text: 'Suspended',
      },
    ].filter(item => item.value > 0);
  }, [teamStatistics]);

  // Filter and sort athletes
  const filteredAndSortedAthletes = useMemo(() => {
    // Filter athletes
    let filtered = athletes.filter((athlete) => {
      const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' || athlete.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Sort athletes
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'healthScore':
          comparison = a.healthScore - b.healthScore;
          break;
      }
      return sortAscending ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, filterStatus, sortBy, sortAscending]);

  // Bar chart data with metric names - from team statistics
  const barChartData = teamStatistics?.barChartData || [
    { value: 0, label: 'M1', metricName: 'Resting\nHeart Rate' },
    { value: 0, label: 'M2', metricName: 'Heart Rate\nVariability' },
    { value: 0, label: 'M3', metricName: 'Heart Rate\nRecovery' },
    { value: 0, label: 'M4', metricName: 'Sleep\nQuality' },
    { value: 0, label: 'M5', metricName: 'Sleep\nDuration' },
    { value: 0, label: 'M6', metricName: 'Activity\nLevel' },
    { value: 0, label: 'M7', metricName: 'Overall\nRecovery' },
  ];
  
  // Calculate team average from team statistics
  const teamAverage = teamStatistics?.teamAverage || 0;
  
  // Previous period data for comparison - from team statistics
  const previousAverage = teamStatistics?.previousAverage || null;
  const averageChange = teamStatistics?.averageChange || 0;

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
      colors={[SemanticColors.background, '#1a0a2e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      <ScrollView
        ref={scrollViewRef}
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading team data...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Team Analytics */}
        {!loading && (
          <View style={styles.teamAnalyticsSection}>
            <View style={styles.analyticsHeader}>
              <Text style={styles.sectionTitle}>Team Analytics</Text>
            </View>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>Total Athletes</Text>
                <Text style={styles.analyticsValue}>{teamStatistics?.totalAthletes || 0}</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>Avg. Performance</Text>
                <Text style={styles.analyticsValue}>{teamStatistics?.avgPerformance || 0}%</Text>
              </View>
              <View style={[styles.analyticsCard, styles.atRiskCard]}>
                <Text style={styles.analyticsLabel}>At Risk Athletes</Text>
                <Text style={[styles.analyticsValue, styles.atRiskValue]}>{teamStatistics?.atRiskCount || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Athlete Status Distribution */}
        {!loading && (
          <View style={styles.distributionSection}>
            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>Athlete Status Distribution</Text>
              <Text style={styles.distributionSubtitle}>Count</Text>
              <Text style={styles.distributionHint}>Click segments or legend to filter players</Text>
              {pieChartData.length > 0 ? (
                <View style={styles.pieChartContainer}>
                  <PieChart
                data={pieChartData.map((item) => ({
                  ...item,
                  onPress: () => {
                    // Map pie chart text to filter status
                    const statusMap: Record<string, FilterStatus> = {
                      'Healthy': 'healthy',
                      'Injured': 'injured',
                      'Suspended': 'suspended',
                    };
                    const filterStatus = statusMap[item.text] || 'all';
                    setFilterStatus(filterStatus);
                    // Scroll to filter section after a short delay
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: filterSectionY.current - 20, animated: true });
                    }, 100);
                  },
                }))}
                radius={80}
                focusOnPress
                showText={false}
                strokeWidth={2}
                strokeColor={SemanticColors.background}
                centerLabelComponent={() => {
                  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
                  return (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, color: SemanticColors.textPrimary, fontWeight: 'bold' }}>
                        {total}
                      </Text>
                      <Text style={{ fontSize: 12, color: SemanticColors.textSecondary }}>
                        Total
                      </Text>
                    </View>
                  );
                }}
              />
                </View>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>No players with status data</Text>
                </View>
              )}
              <View style={styles.pieChartLegend}>
              {pieChartData.map((item, index) => {
                const statusMap: Record<string, FilterStatus> = {
                  'Healthy': 'healthy',
                  'Injured': 'injured',
                  'Suspended': 'suspended',
                };
                const filterStatus = statusMap[item.text] || 'all';
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.legendItem}
                    onPress={() => {
                      setFilterStatus(filterStatus);
                      // Scroll to filter section after a short delay
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: filterSectionY.current - 20, animated: true });
                      }, 100);
                    }}
                    activeOpacity={0.7}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}: {item.value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.distributionLabel}>Status</Text>
          </View>
        </View>
        )}

        {/* Team Performance Metrics */}
        {!loading && (
          <View style={styles.performanceSection}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <View>
                  <Text style={styles.performanceTitle}>Team Performance Metrics</Text>
                  <Text style={styles.performanceSubtitle}>Scores</Text>
                </View>
                <View style={styles.performanceComparison}>
                  <Text style={styles.comparisonLabel}>Avg: {teamAverage}%</Text>
                  {previousAverage !== null && (
                    <View style={styles.comparisonChange}>
                      <Text style={[
                        styles.comparisonArrow,
                        averageChange >= 0 ? styles.comparisonPositive : styles.comparisonNegative
                      ]}>
                        {averageChange >= 0 ? '↑' : '↓'}
                      </Text>
                      <Text style={[
                        styles.comparisonValue,
                        averageChange >= 0 ? styles.comparisonPositive : styles.comparisonNegative
                      ]}>
                        {Math.abs(averageChange)}% vs last period
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {barChartData.some(item => item.value > 0) ? (
                <View style={styles.barChartContainer}>
                  <BarChart
                data={barChartData}
                width={screenWidth - 72}
                height={180}
                spacing={30}
                barWidth={30}
                noOfSections={4}
                maxValue={100}
                yAxisThickness={1}
                xAxisThickness={1}
                yAxisTextStyle={{
                  color: SemanticColors.textSecondary,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: SemanticColors.textSecondary,
                  fontSize: 10,
                }}
                frontColor={BrandColors.purple}
                gradientColor={BrandColors.purpleDark}
                isAnimated
                animationDuration={800}
                showGradient
                roundedTop
                roundedBottom
                hideRules={false}
                rulesColor={SemanticColors.borderMuted}
                rulesType="solid"
                yAxisColor={SemanticColors.borderMuted}
                xAxisColor={SemanticColors.borderMuted}
                showVerticalLines
                verticalLinesColor={SemanticColors.borderMuted}
                verticalLinesThickness={0.5}
                showReferenceLine1
                referenceLine1Config={{
                  color: SemanticColors.primary,
                  thickness: 2,
                  type: 'solid',
                }}
                onPress={(item: any, index: number) => {
                  // TODO: Navigate to athlete details or show metric breakdown
                  console.log(`Pressed ${barChartData[index].metricName}: ${item.value}%`);
                }}
              />
                </View>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>No metric data available yet</Text>
                </View>
              )}
              <View style={styles.metricLabels}>
              {/* Top row - first 3 metrics */}
              <View style={styles.metricRow}>
                {barChartData.slice(0, 3).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.metricLabelItem}
                    onPress={() => {
                      // TODO: Show metric details
                      console.log(`View details for ${item.metricName}`);
                    }}
                    activeOpacity={0.7}>
                    <Text style={styles.metricLabelText}>{item.label}</Text>
                    <Text style={styles.metricNameText} numberOfLines={2}>
                      {item.metricName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Bottom row - last 4 metrics */}
              <View style={styles.metricRow}>
                {barChartData.slice(3, 7).map((item, index) => (
                  <TouchableOpacity
                    key={index + 3}
                    style={styles.metricLabelItem}
                    onPress={() => {
                      // TODO: Show metric details
                      console.log(`View details for ${item.metricName}`);
                    }}
                    activeOpacity={0.7}>
                    <Text style={styles.metricLabelText}>{item.label}</Text>
                    <Text style={styles.metricNameText} numberOfLines={2}>
                      {item.metricName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
        )}

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
        <View
          style={styles.filterSection}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            filterSectionY.current = y;
          }}>
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
          <View style={styles.rosterHeader}>
            <Text style={styles.rosterTitle}>Athlete Roster</Text>
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'name' && styles.sortButtonSelected]}
                  onPress={() => {
                    if (sortBy === 'name') {
                      setSortAscending(!sortAscending);
                    } else {
                      setSortBy('name');
                      setSortAscending(true);
                    }
                  }}
                  activeOpacity={0.7}>
                  <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextSelected]}>
                    Name {sortBy === 'name' && (sortAscending ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'status' && styles.sortButtonSelected]}
                  onPress={() => {
                    if (sortBy === 'status') {
                      setSortAscending(!sortAscending);
                    } else {
                      setSortBy('status');
                      setSortAscending(true);
                    }
                  }}
                  activeOpacity={0.7}>
                  <Text style={[styles.sortButtonText, sortBy === 'status' && styles.sortButtonTextSelected]}>
                    Status {sortBy === 'status' && (sortAscending ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'healthScore' && styles.sortButtonSelected]}
                  onPress={() => {
                    if (sortBy === 'healthScore') {
                      setSortAscending(!sortAscending);
                    } else {
                      setSortBy('healthScore');
                      setSortAscending(false);
                    }
                  }}
                  activeOpacity={0.7}>
                  <Text style={[styles.sortButtonText, sortBy === 'healthScore' && styles.sortButtonTextSelected]}>
                    Score {sortBy === 'healthScore' && (sortAscending ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.rosterList}>
            {filteredAndSortedAthletes.map((athlete) => (
              <AthleteRow key={athlete.id} athlete={athlete} />
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'csv' | 'share') => void;
}

function ExportModal({ visible, onClose, onExport }: ExportModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.exportModal}>
        <View style={styles.exportModalHeader}>
          <Text style={styles.exportModalTitle}>Export Report</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={SemanticColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.exportModalDescription}>
          Choose how you'd like to export the team data:
        </Text>
        <View style={styles.exportOptions}>
          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => onExport('pdf')}
            activeOpacity={0.7}>
            <Ionicons name="document-text" size={24} color={SemanticColors.primary} />
            <View style={styles.exportOptionContent}>
              <Text style={styles.exportOptionTitle}>PDF Report</Text>
              <Text style={styles.exportOptionDescription}>
                Generate a PDF report for medical professionals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => onExport('csv')}
            activeOpacity={0.7}>
            <Ionicons name="document" size={24} color={SemanticColors.primary} />
            <View style={styles.exportOptionContent}>
              <Text style={styles.exportOptionTitle}>CSV Data</Text>
              <Text style={styles.exportOptionDescription}>
                Export raw data as CSV for analysis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => onExport('share')}
            activeOpacity={0.7}>
            <Ionicons name="share-social" size={24} color={SemanticColors.primary} />
            <View style={styles.exportOptionContent}>
              <Text style={styles.exportOptionTitle}>Share Progress</Text>
              <Text style={styles.exportOptionDescription}>
                Share progress with coach or trainer
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SemanticColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function FilterButton({ label, isSelected, onPress }: FilterButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <Text style={styles.filterButtonText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface AthleteRowProps {
  athlete: Athlete;
}

function AthleteRow({ athlete }: AthleteRowProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const handleAthletePress = () => {
    router.push({
      pathname: '/athlete-view',
      params: {
        playerId: athlete.id.toString(),
        playerName: athlete.name,
      },
    } as any);
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return SemanticColors.zoneGreen;
      case 'injured':
        return SemanticColors.zoneRed;
      case 'suspended':
        return '#6B6B6B';
      default:
        return SemanticColors.borderMuted;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return SemanticColors.zoneGreen;
    if (score >= 60) return SemanticColors.zoneYellow;
    return SemanticColors.zoneRed;
  };

  return (
    <Animated.View 
      style={[
        styles.athleteRow,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleAthletePress}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        {/* Status indicator dot */}
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(athlete.status) }]} />
      
      <Image
        source={{
          uri: 'https://api.builder.io/api/v1/image/assets/TEMP/a03a045d12504f2f31d8c20dabf00706eb0a0772?width=54',
        }}
        style={styles.athleteAvatar}
        contentFit="cover"
      />
      <View style={styles.athleteInfo}>
        <View style={styles.athleteNameRow}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          {/* Health score badge */}
          <View style={[styles.healthScoreBadge, { backgroundColor: getHealthScoreColor(athlete.healthScore) }]}>
            <Text style={styles.healthScoreBadgeText}>{athlete.healthScore}%</Text>
          </View>
        </View>
        <View style={styles.athleteMetaRow}>
          <Text style={styles.athleteStatus}>Status: {athlete.status}</Text>
          <Text style={styles.lastSyncText}>• Synced: {athlete.lastSync}</Text>
        </View>
      </View>
      <View style={styles.athleteActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAthletePress}
          activeOpacity={0.7}>
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.alertButton]}
          onPress={() => {
            // TODO: Send alert to athlete
            console.log(`Send alert to ${athlete.name}`);
          }}
          activeOpacity={0.7}>
          <Text style={[styles.actionButtonText, styles.alertButtonText]}>Alert</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
    </Animated.View>
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
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: SemanticColors.background,
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
  analyticsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendArrow: {
    fontSize: 14,
    color: SemanticColors.success,
    fontWeight: Typography.fontWeight.bold as any,
  },
  trendDown: {
    color: SemanticColors.error,
  },
  trendText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.success,
    fontWeight: Typography.fontWeight.medium as any,
  },
  atRiskCard: {
    borderColor: SemanticColors.error,
  },
  atRiskValue: {
    color: SemanticColors.error,
  },
  distributionSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  distributionCard: {
    backgroundColor: SemanticColors.background,
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
    marginBottom: Spacing.xs,
  },
  distributionHint: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    overflow: 'hidden',
  },
  pieChartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
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
    backgroundColor: SemanticColors.background,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
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
  },
  performanceComparison: {
    alignItems: 'flex-end',
  },
  comparisonLabel: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: Spacing.xs,
  },
  comparisonChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonArrow: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold as any,
  },
  comparisonValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
  },
  comparisonPositive: {
    color: SemanticColors.success,
  },
  comparisonNegative: {
    color: SemanticColors.error,
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
  metricLabels: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  metricLabelItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  metricLabelText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.semibold as any,
    marginBottom: 2,
  },
  metricNameText: {
    fontSize: Typography.fontSize.xs,
    color: SemanticColors.textTertiary,
    textAlign: 'center',
    minHeight: 32,
    lineHeight: 16,
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
  rosterHeader: {
    marginBottom: Spacing.lg,
  },
  rosterTitle: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.md,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: SemanticColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
  },
  sortButtonSelected: {
    backgroundColor: SemanticColors.primary,
    borderColor: SemanticColors.primary,
  },
  sortButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
    fontWeight: Typography.fontWeight.medium as any,
  },
  sortButtonTextSelected: {
    color: SemanticColors.textOnPrimary,
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  athleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  athleteName: {
    fontSize: 15,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
  },
  healthScoreBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  healthScoreBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: SemanticColors.textOnSurface,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  athleteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  athleteStatus: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
  },
  lastSyncText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
  },
  athleteActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    backgroundColor: SemanticColors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonText: {
    color: SemanticColors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  alertButton: {
    backgroundColor: SemanticColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
  },
  alertButtonText: {
    color: SemanticColors.textPrimary,
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
  exportModal: {
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
  exportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  exportModalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  exportModalDescription: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  exportOptions: {
    gap: Spacing.md,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: SemanticColors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
    gap: Spacing.md,
  },
  exportOptionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  exportOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textPrimary,
  },
  exportOptionDescription: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textSecondary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: SemanticColors.textSecondary,
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    color: SemanticColors.error,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  emptyChartContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SemanticColors.borderSecondary,
    borderRadius: BorderRadius.md,
  },
  emptyChartText: {
    color: SemanticColors.textTertiary,
    fontSize: Typography.fontSize.sm,
  },
});

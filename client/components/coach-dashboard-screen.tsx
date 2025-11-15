import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { BrandColors } from '@/constants/theme';

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
  const router = useRouter();

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || athlete.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        <Text style={styles.navTitle}>Coach Dashboard</Text>
        <View style={styles.navIcons}>
          <Text style={styles.iconEmoji}>📊</Text>
          <Text style={styles.iconEmoji}>⚙️</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
              <Svg width={180} height={180} viewBox="0 0 312 180" fill="none">
                <Path
                  d="M226 90C226 128.66 194.66 160 156 160C117.34 160 86 128.66 86 90C86 51.3401 117.34 20 156 20C194.66 20 226 51.3401 226 90Z"
                  fill="#8CD47E"
                  fillOpacity="0.866667"
                />
                <Path
                  d="M156 20C165.193 20 174.295 21.8106 182.788 25.3284C191.281 28.8463 198.997 34.0024 205.497 40.5025L156 90V20Z"
                  fill="#F8D66D"
                />
                <Path
                  d="M205.497 40.5025C211.998 47.0026 217.154 54.7194 220.672 63.2122C224.189 71.705 226 80.8075 226 90C226 99.1925 224.189 108.295 220.672 116.788C217.154 125.281 211.998 132.997 205.497 139.497L156 90L205.497 40.5025Z"
                  fill="#FF6961"
                />
              </Svg>
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
              {/* Grid lines */}
              <Svg
                style={StyleSheet.absoluteFill}
                width="100%"
                height="100%"
                viewBox="0 0 345 160"
                preserveAspectRatio="none">
                <Path d="M0 0.5H345" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 40.5H345" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 80.5H345" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 120.5H345" stroke="white" strokeDasharray="3 3" />
                <Path d="M0 159.5H345" stroke="white" />
              </Svg>
              {/* Bar chart bars */}
              <View style={styles.barChartBars}>
                <View style={[styles.bar, { height: 131 }]} />
                <View style={[styles.bar, { height: 94 }]} />
                <View style={[styles.bar, { height: 16 }]} />
                <View style={[styles.bar, { height: 98 }]} />
                <View style={[styles.bar, { height: 76 }]} />
                <View style={[styles.bar, { height: 117 }]} />
                <View style={[styles.bar, { height: 87 }]} />
              </View>
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
    </SafeAreaView>
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
  teamAnalyticsSection: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  analyticsCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BrandColors.white,
    borderRadius: 6,
    padding: 12,
  },
  analyticsLabel: {
    fontSize: 14,
    color: BrandColors.white,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '500',
    color: BrandColors.white,
  },
  analyticsChange: {
    fontSize: 14,
    color: BrandColors.white,
  },
  distributionSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  distributionCard: {
    borderWidth: 1,
    borderColor: BrandColors.white,
    borderRadius: 6,
    padding: 12,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 4,
  },
  distributionSubtitle: {
    fontSize: 12,
    color: BrandColors.white,
    marginBottom: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  distributionLabel: {
    fontSize: 12,
    color: BrandColors.white,
    textAlign: 'right',
    marginTop: 4,
  },
  performanceSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  performanceCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    padding: 12,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 4,
  },
  performanceSubtitle: {
    fontSize: 12,
    color: BrandColors.white,
    marginBottom: 8,
  },
  barChartContainer: {
    borderWidth: 1,
    borderColor: BrandColors.white,
    height: 160,
    position: 'relative',
    marginBottom: 4,
  },
  barChartBars: {
    position: 'absolute',
    left: 16,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    height: 131,
    width: '100%',
    paddingRight: 16,
  },
  bar: {
    width: 28,
    backgroundColor: BrandColors.white,
  },
  performanceLabel: {
    fontSize: 12,
    color: BrandColors.white,
    textAlign: 'right',
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 8,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderColor: BrandColors.white,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    color: BrandColors.white,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  searchHint: {
    fontSize: 12,
    color: BrandColors.white,
    marginTop: 4,
  },
  filterSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(190, 174, 174, 0.30)',
  },
  filterButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  filterButtonText: {
    fontSize: 14,
    color: BrandColors.white,
  },
  filterHint: {
    fontSize: 12,
    color: BrandColors.white,
  },
  rosterSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  rosterTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: BrandColors.white,
    marginBottom: 16,
  },
  rosterList: {
    gap: 0,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  athleteAvatar: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 14,
    color: BrandColors.white,
  },
  athleteStatus: {
    fontSize: 12,
    color: '#CACACA',
  },
  viewAnalyticsButton: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAnalyticsText: {
    color: BrandColors.black,
    fontSize: 12,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 32,
      height: 19,
    },
  });

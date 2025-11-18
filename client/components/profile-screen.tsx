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

export default function ProfileScreen() {
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
          <Text style={styles.navTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Profile Picture Section */}
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <Text style={styles.profilePictureText}>JD</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>John Doe</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>john.doe@example.com</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>Coach</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Team</Text>
              <Text style={styles.infoValue}>Varsity Football</Text>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingItemText}>Change Password</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingItemText}>Notification Preferences</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingItemText}>Privacy Settings</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingItemText}>Export Data</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={BrandColors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingItemText}>Delete Account</Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke={SemanticColors.error}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SemanticColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profilePictureText: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold as any,
    color: SemanticColors.textOnPrimary,
  },
  editButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: SemanticColors.borderPrimary,
  },
  editButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium as any,
    color: SemanticColors.primary,
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.primary,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textSecondary,
    fontWeight: Typography.fontWeight.medium as any,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.normal as any,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  settingItemText: {
    fontSize: Typography.fontSize.base,
    color: SemanticColors.textPrimary,
    fontWeight: Typography.fontWeight.medium as any,
  },
});


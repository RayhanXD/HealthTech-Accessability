import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const slideAnim = React.useRef(new Animated.Value(-screenWidth)).current;
  const iconAnim = React.useRef(new Animated.Value(0)).current; // 0 = hamburger, 1 = X
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Slide in animation when modal becomes visible - from left side
  React.useEffect(() => {
    if (visible) {
      // Reset animation value before starting
      slideAnim.setValue(-screenWidth);
      setIsAnimating(true);
      // Animate sidebar and icon simultaneously
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(iconAnim, {
          toValue: 1, // Animate to X
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    } else {
      // Reset icon to hamburger when closing
      iconAnim.setValue(0);
    }
  }, [visible, screenWidth]);

  const handleClose = () => {
    setIsAnimating(true);
    // Animate sidebar and icon simultaneously
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(iconAnim, {
        toValue: 0, // Animate back to hamburger
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onClose();
    });
  };

  // Sidebar width - takes up 70% of screen width
  const sidebarWidth = screenWidth * 0.7;
  const statusBarHeight = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);
  
  // Calculate top margin - doesn't go all the way to the top
  const topMargin = statusBarHeight + 30; // Status bar + nav bar height + spacing
  const sidebarHeight = screenHeight - topMargin; // Height from top margin to bottom

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/sign-in' as any);
              onClose();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOptionPress = (option: string) => {
    // Handle different settings options
    switch (option) {
      case 'profile':
        Alert.alert('Profile', 'Profile settings coming soon!');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notification preferences coming soon!');
        break;
      case 'health':
        Alert.alert('Health Data', 'Health data settings coming soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy', 'Privacy settings coming soon!');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Help center coming soon!');
        break;
      case 'about':
        Alert.alert('About', 'Concussion Recovery Tracker\nVersion 1.0.0');
        break;
      case 'terms':
        Alert.alert('Terms and Conditions', 'Terms and conditions coming soon!');
        break;
      default:
        break;
    }
  };

  const SettingOption = ({ icon, title, onPress, isLast = false }: {
    icon: 'person.fill' | 'heart.fill' | 'lock.fill' | 'questionmark.circle.fill' | 'info.circle.fill' | 'doc.text.fill';
    title: string;
    onPress: () => void;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.optionItem, !isLast && styles.optionItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.optionIconContainer}>
        <IconSymbol name={icon} size={20} color={BrandColors.purple} />
      </View>
      <Text style={styles.optionText}>{title}</Text>
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
  );

  const NotificationToggle = () => (
    <View style={[styles.optionItem, styles.optionItemBorder]}>
      <View style={styles.optionIconContainer}>
        <IconSymbol name="bell.fill" size={20} color={BrandColors.purple} />
      </View>
      <Text style={styles.optionText}>Notifications</Text>
      <View style={styles.switchContainer}>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: SemanticColors.borderMuted, true: BrandColors.purple }}
          thumbColor={BrandColors.white}
          ios_backgroundColor={SemanticColors.borderMuted}
          style={styles.switch}
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        {/* Backdrop - closes modal when tapped */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        {/* Sidebar - slides in from left */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              width: sidebarWidth,
              height: sidebarHeight,
              top: topMargin,
              left: 0,
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          {/* Header with animated hamburger/X icon to close */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.iconButton} activeOpacity={0.7}>
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
            <Text style={styles.title}>Settings</Text>
            <View style={styles.iconButton} />
          </View>

          {/* Scrollable Settings Options */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              <SettingOption
                icon="person.fill"
                title="Profile"
                onPress={() => handleOptionPress('profile')}
              />
              <SettingOption
                icon="heart.fill"
                title="Health Data"
                onPress={() => handleOptionPress('health')}
              />
              <SettingOption
                icon="lock.fill"
                title="Privacy & Security"
                onPress={() => handleOptionPress('privacy')}
              />
              <SettingOption
                icon="questionmark.circle.fill"
                title="Help & Support"
                onPress={() => handleOptionPress('help')}
              />
              <SettingOption
                icon="info.circle.fill"
                title="About"
                onPress={() => handleOptionPress('about')}
              />
              <SettingOption
                icon="doc.text.fill"
                title="Terms and Conditions"
                onPress={() => handleOptionPress('terms')}
              />
              <NotificationToggle />
            </View>
          </ScrollView>

          {/* Fixed Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Sign Out Button */}
            <View style={styles.signOutContainer}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.7}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Version Info */}
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    backgroundColor: SemanticColors.background,
    borderRightWidth: 1,
    borderRightColor: SemanticColors.borderMuted,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold as any,
    color: SemanticColors.textPrimary,
    textAlign: 'left',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  optionsContainer: {
    marginTop: Spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  optionIconContainer: {
    width: 28,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium as any,
    color: SemanticColors.textPrimary,
  },
  switchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: SemanticColors.borderMuted,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  signOutContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  signOutButton: {
    backgroundColor: SemanticColors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textOnPrimary,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    color: SemanticColors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});


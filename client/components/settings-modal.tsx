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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { BrandColors, SemanticColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate top margin based on device - status bar + percentage of screen
  const statusBarHeight = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);
  const topMargin = statusBarHeight + (screenHeight * 0.04); // Status bar + 4% of screen height
  
  // Modal sizing based on screen dimensions (using percentages)
  const modalWidth = Math.min(screenWidth * 0.9, 400);
  const modalMaxHeight = screenHeight * 0.75;
  const modalMinHeight = screenHeight * 0.25;
  const horizontalPadding = screenWidth * 0.05; // 5% of screen width

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
              // Clear all stored data
              await AsyncStorage.clear();
              // Navigate to sign-in screen
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[
          styles.modalContent,
          {
            width: modalWidth,
            maxHeight: modalMaxHeight,
            minHeight: modalMinHeight,
            marginTop: topMargin,
            marginHorizontal: horizontalPadding,
          }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z"
                  fill={BrandColors.white}
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Settings Content */}
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.7}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    backgroundColor: SemanticColors.background,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.borderMuted,
  },
  title: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    minHeight: 100,
  },
  signOutButton: {
    backgroundColor: SemanticColors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold as any,
    color: SemanticColors.textOnPrimary,
  },
});


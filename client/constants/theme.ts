/**
 * Global Theme System with Semantic Tokens
 * This file provides a centralized theme system with semantic tokens,
 * reusable animations, and design tokens that can be used across the app.
 */

import { Platform } from 'react-native';

// Base Brand Colors
export const BrandColors = {
  purple: '#B89EF6',//'#8B5CF6',
  purpleDark: '#915fe7ff',
  green: '#78E66C',
  white: '#FFFFFF',
  black: '#000000',
  offWhite: '#FFFCFC',
  lightGray: '#F8F8FF',
  darkGray: '#212121',
  lightBeige: '#F4EAEA',
  progressGray: '#D9D9D9',
  cardGray: '#DBDBDB',
};


// Semantic Color Tokens
export const SemanticColors = {
  // Primary brand colors
  primary: BrandColors.purple,
  primaryDark: BrandColors.purpleDark,
  
  // Status colors
  success: BrandColors.green,
  warning: '#D2DB70',
  error: '#E44F4F',
  info: BrandColors.purple,
  
  // Background colors
  background: BrandColors.black,
  backgroundSecondary: BrandColors.darkGray,
  surface: BrandColors.white,
  surfaceSecondary: BrandColors.darkGray,
  surfaceElevated: '#2A2A2A',
  
  // Text colors (following design system hierarchy)
  textPrimary: BrandColors.white,
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  textOnPrimary: BrandColors.white,
  textOnSurface: BrandColors.black,
  
  // Border colors (following design system hierarchy)
  borderPrimary: BrandColors.purple,
  borderSecondary: BrandColors.white,
  borderMuted: 'rgba(255, 255, 255, 0.1)',
  borderDivider: 'rgba(255, 255, 255, 0.05)',
  
  // Zone colors (for metrics/health indicators)
  zoneGreen: '#40BF80',
  zoneYellow: '#D2DB70',
  zoneRed: '#E44F4F',
};

// Spacing Tokens (in pixels)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
};

// Typography Tokens
export const Typography = {
  fontFamily: {
    sans: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extrabold: 'Inter-ExtraBold',
    // Fallback for web
    ...(Platform.OS === 'web' && {
      sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }),
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 28,
    '4xl': 48,
  } as const,
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border Radius Tokens
export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  full: 9999,
};

// Shadow Tokens
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Futuristic Design Tokens
export const FuturisticDesign = {
  // Glassmorphism effects
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  // Glow effects
  glow: {
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowSubtle: {
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glowGreen: {
    shadowColor: BrandColors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  // Futuristic borders
  borderGlow: {
    borderWidth: 1,
    borderColor: BrandColors.purple,
    shadowColor: BrandColors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  // Elevated surfaces with depth
  surfaceElevated: {
    backgroundColor: SemanticColors.surfaceElevated,
    ...Shadows.md,
  },
  surfaceFloating: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(184, 158, 246, 0.1)',
  },
};

// Animation Tokens
export const Animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 300,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  // Reusable animation configurations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
  },
  slideUp: {
    from: { transform: [{ translateY: 20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
    duration: 300,
  },
  scaleIn: {
    from: { transform: [{ scale: 0.95 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
    duration: 200,
  },
};

// Component-Specific Tokens
export const ComponentTokens = {
  // Card styles - minimalistic and futuristic
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
    backgroundColor: SemanticColors.surfaceElevated,
    ...FuturisticDesign.glowSubtle,
  },
  cardGlass: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    ...FuturisticDesign.glassDark,
  },
  // Button styles - modern and clean
  button: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
  },
  buttonPrimary: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    backgroundColor: BrandColors.purple,
    ...FuturisticDesign.glow,
  },
  // Input styles - minimalistic
  input: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.borderMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  // Navbar styles
  navbar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
};

// Legacy support (for backward compatibility)
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Typography.fontFamily;

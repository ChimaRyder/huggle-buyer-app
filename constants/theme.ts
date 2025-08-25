/**
 * Centralized theme system for consistent styling across the application
 * Import specific objects as needed: import { spacing, colors, typography } from '@/constants/theme'
 */

// Spacing scale following 4px base unit
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Typography scale
export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
    hero: 32,
  },
  fontWeights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Border radius scale
export const radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  full: 9999,
} as const;

// Unified color palette following industry standards
export const palette = {
  // Primary color - Fresh Green for produce theme
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  primaryContrast: '#FFFFFF',
  
  // Secondary color - Complementary Blue-Green
  secondary: '#2E7D32',
  secondaryLight: '#4DB6AC',
  secondaryDark: '#00695C',
  secondaryContrast: '#FFFFFF',
  
  // Info color - Blue for information
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  infoContrast: '#FFFFFF',
  
  // Warning color - Amber for warnings
  warning: '#FFC107',
  warningLight: '#FFD54F',
  warningDark: '#FFA000',
  warningContrast: '#212121',
  
  // Danger/Error color - Red for errors
  danger: '#F44336',
  dangerLight: '#EF5350',
  dangerDark: '#D32F2F',
  dangerContrast: '#FFFFFF',
  
  // Success color - Green for success states
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',
  successContrast: '#FFFFFF',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
} as const;

// Semantic color mappings for consistent usage
export const colors = {
  ...palette,
  
  // Text colors
  text: {
    primary: palette.gray900,
    secondary: palette.gray700,
    tertiary: palette.gray500,
    inverse: palette.white,
    primaryInverted: palette.white,
    secondaryInverted: palette.gray300,
    tertiaryInverted: palette.gray400,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,
  },
  
  // Background colors
  background: {
    primary: palette.white,
    secondary: palette.gray50,
    tertiary: palette.gray100,
    inverse: palette.gray900,
    success: palette.successLight,
    info: palette.infoLight,
    warning: palette.warningLight,
    danger: palette.dangerLight,
    successSubtle: '#E8F5E9',
    infoSubtle: '#E3F2FD',
    warningSubtle: '#FFF8E1',
    dangerSubtle: '#FFEBEE',
  },
  
  // Border colors
  border: {
    primary: palette.gray300,
    secondary: palette.gray400,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,
    focus: palette.primary,
  },
  
  // Icon colors
  icon: {
    primary: palette.gray700,
    secondary: palette.gray500,
    tertiary: palette.gray400,
    inverse: palette.white,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,
    primaryInverted: palette.white,
    secondaryInverted: palette.gray300,
  },
  
  // Badge colors
  badge: {
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,
    primaryContrast: palette.primaryContrast,
    secondaryContrast: palette.secondaryContrast,
    successContrast: palette.successContrast,
    infoContrast: palette.infoContrast,
    warningContrast: palette.warningContrast,
    dangerContrast: palette.dangerContrast,
  },
} as const;

// Gradient definitions
export const gradients = {
  primary: [colors.primaryLight, '#FFFFFF'],
  secondary: [colors.secondary, colors.primary],
  info: [colors.info, '#21CBF3'],
  warning: [colors.warning, '#FFB300'],
  danger: [colors.danger, '#FF7043'],
  success: [colors.success, '#81C784'],
  sunset: ['#FF5722', '#FF9800', '#FFC107'],
  ocean: ['#2196F3', '#21CBF3', '#4CAF50'],
} as const;

// Shadow definitions
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Component-specific styles
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    padding: {
      sm: { horizontal: spacing.md, vertical: spacing.xs },
      md: { horizontal: spacing.lg, vertical: spacing.sm },
      lg: { horizontal: spacing.xl, vertical: spacing.md },
    },
  },
  input: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    padding: {
      horizontal: spacing.md,
      vertical: spacing.sm,
    },
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    shadow: shadows.md,
  },
} as const;

// Layout constants
export const layout = {
  screenPadding: spacing.lg,
  sectionSpacing: spacing.xl,
  componentSpacing: spacing.md,
  minTouchTarget: 44,
} as const;

// Animation constants
export const animations = {
  durations: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Complete theme object
export const theme = {
  spacing,
  typography,
  radii,
  colors,
  gradients,
  shadows,
  components,
  layout,
  animations,
  breakpoints,
} as const;

// Export font sizes for backward compatibility
export const fontSizes = typography.fontSizes;

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;

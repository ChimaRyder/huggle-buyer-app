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

// Brand colors
export const brandColors = {
  primary: '#548C2F',
  primaryLight: '#6DA23B',
  primaryDark: '#3D6522',
  secondary: '#0d2329',
  accent: '#FF6B35',
  accentLight: '#FF8555',
  accentDark: '#E5552B',
} as const;

// Semantic colors
export const semanticColors = {
  success: '#22C55E',
  successLight: '#4ADE80',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
} as const;

// Neutral colors
export const neutralColors = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

// Combined color palette
export const colors = {
  ...brandColors,
  ...semanticColors,
  ...neutralColors,
  
  // Background colors
  background: {
    primary: '#F7F8FA',
    secondary: '#FFFFFF',
    tertiary: '#F3F4F6',
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Border colors
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#548C2F',
  },
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

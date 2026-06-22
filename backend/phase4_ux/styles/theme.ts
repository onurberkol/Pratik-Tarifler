/**
 * Theme — Pratik Tarifler Design System
 * ======================================
 * Sıcak ton (Türk mutfak kültürü) + modern, okunaklı tipografi
 */

export const colors = {
  // Background
  background: '#FAF7F2',           // krem - sıcak beyaz
  backgroundElevated: '#FFFFFF',
  backgroundMuted: '#F0EBE3',
  
  // Text
  text: '#2D2419',                 // koyu kahve
  textSecondary: '#7A6F60',
  textMuted: '#A8A099',
  textInverse: '#FFFFFF',
  
  // Brand
  primary: '#D89A1E',              // terracotta - Türk turuncu/sarı
  primaryDark: '#B8801A',
  primaryLight: '#FFF4E0',
  
  // Mod renkleri
  modePantry: '#E8B53B',           // sıcak sarı
  modeSupply: '#5B8C5A',           // doğal yeşil
  modeDiscover: '#4A7A9C',         // mavi
  
  // Semantic
  success: '#5B8C5A',
  warning: '#F0A500',
  error: '#C73E3A',
  info: '#4A7A9C',
  
  // Borders
  border: '#E5DFD4',
  borderStrong: '#C9C2B5',
  
  // Premium
  premium: '#D4A847',              // altın
  premiumGradient: ['#FFD700', '#FF8C00'] as const,
  
  // Overlay
  overlay: 'rgba(0,0,0,0.45)',
  shadow: 'rgba(45,36,25,0.08)',
} as const;

export const fonts = {
  // Sistem fontları kullan — performance
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardElevated: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  fonts,
  fontSize,
  spacing,
  radius,
  shadow,
} as const;

export type Theme = typeof theme;

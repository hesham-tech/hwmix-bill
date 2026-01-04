/**
 * Design System - Theme Configuration
 * نظام التصميم الموحد
 */

export const colors = {
  // Primary Colors
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',

  // Secondary Colors
  secondary: '#424242',
  secondaryDark: '#212121',
  secondaryLight: '#757575',

  // Status Colors
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#81C784',

  warning: '#FF9800',
  warningDark: '#F57C00',
  warningLight: '#FFB74D',

  error: '#F44336',
  errorDark: '#D32F2F',
  errorLight: '#E57373',

  info: '#2196F3',
  infoDark: '#1976D2',
  infoLight: '#64B5F6',

  accent: '#9C27B0',
  accentDark: '#7B1FA2',
  accentLight: '#BA68C8',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background Colors
  background: '#F5F5F5',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',

  // Text Colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.60)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
  },

  textDark: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.60)',
    disabled: 'rgba(255, 255, 255, 0.38)',
    hint: 'rgba(255, 255, 255, 0.38)',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  accent: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  green: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
};

export const typography = {
  fontFamily: {
    heading: '"Cairo", sans-serif',
    body: '"Tajawal", sans-serif',
    mono: '"Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const shadows = {
  none: 'none',
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
  '2xl': '0 20px 40px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const transitions = {
  fast: 'all 150ms ease-in-out',
  base: 'all 200ms ease-in-out',
  slow: 'all 300ms ease-in-out',
  slower: 'all 500ms ease-in-out',
};

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1264,
  xl: 1904,
};

export const zIndex = {
  drawer: 1200,
  appBar: 1100,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Export as default theme object
export default {
  colors,
  gradients,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
};

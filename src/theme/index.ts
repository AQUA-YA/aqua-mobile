import {
  configureFonts,
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

const sharedTheme = {
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

const palette = {
  primary: '#0077B6',
  primaryLight: '#00B4D8',
  secondary: '#48CAE4',
  accent: '#90E0EF',
  background: '#F0F8FF',
  surface: '#FFFFFF',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
};

const darkPalette = {
  primary: '#00B4D8',
  primaryLight: '#48CAE4',
  secondary: '#90E0EF',
  accent: '#0077B6',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  onPrimary: '#000000',
  onSecondary: '#FFFFFF',
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  ...sharedTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    primaryContainer: palette.primaryLight,
    secondary: palette.secondary,
    secondaryContainer: palette.accent,
    background: palette.background,
    surface: palette.surface,
    surfaceVariant: palette.background,
    error: palette.error,
    onPrimary: palette.onPrimary,
    onSecondary: palette.onSecondary,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: palette.surface,
      level1: palette.background,
      level2: palette.background,
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  ...sharedTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkPalette.primary,
    primaryContainer: darkPalette.primaryLight,
    secondary: darkPalette.secondary,
    secondaryContainer: darkPalette.accent,
    background: darkPalette.background,
    surface: darkPalette.surface,
    surfaceVariant: '#2C2C2C',
    error: darkPalette.error,
    onPrimary: darkPalette.onPrimary,
    onSecondary: darkPalette.onSecondary,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: darkPalette.surface,
      level1: '#2C2C2C',
      level2: '#333333',
    },
  },
};

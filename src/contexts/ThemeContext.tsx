import React, { createContext, useContext, ReactNode } from 'react';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  
  // Text colors
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Outline colors
  outline: string;
  outlineVariant: string;
  
  // Shadow
  shadow: string;
  scrim: string;
  
  // Inverse colors
  inverseSurface: string;
  onInverseSurface: string;
  inversePrimary: string;
  
  // Glassmorphism colors
  glassBackground: string;
  glassSurface: string;
  glassBorder: string;
  glassShadow: string;
  
  // Gradient colors
  gradientStart: string;
  gradientEnd: string;
  
  // Status bar
  statusBar: 'light-content' | 'dark-content';
}

const theme: ThemeColors = {
  // Background colors
  background: '#000000',
  surface: 'rgba(0, 0, 0, 0.8)',
  surfaceVariant: 'rgba(0, 0, 0, 0.6)',
  surfaceContainer: 'rgba(0, 0, 0, 0.7)',
  surfaceContainerHigh: 'rgba(0, 0, 0, 0.85)',
  surfaceContainerHighest: 'rgba(0, 0, 0, 0.9)',
  
  // Text colors
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#e5e7eb',
  
  // Primary colors
  primary: '#a855f7',
  onPrimary: '#ffffff',
  primaryContainer: 'rgba(168, 85, 247, 0.2)',
  onPrimaryContainer: '#e9d5ff',
  
  // Secondary colors
  secondary: '#06b6d4',
  onSecondary: '#ffffff',
  secondaryContainer: 'rgba(6, 182, 212, 0.2)',
  onSecondaryContainer: '#67e8f9',
  
  // Tertiary colors
  tertiary: '#f59e0b',
  onTertiary: '#ffffff',
  tertiaryContainer: 'rgba(245, 158, 11, 0.2)',
  onTertiaryContainer: '#fbbf24',
  
  // Error colors
  error: '#ef4444',
  onError: '#ffffff',
  errorContainer: 'rgba(239, 68, 68, 0.2)',
  onErrorContainer: '#fca5a5',
  
  // Outline colors
  outline: 'rgba(255, 255, 255, 0.3)',
  outlineVariant: 'rgba(255, 255, 255, 0.2)',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.8)',
  scrim: 'rgba(0, 0, 0, 0.9)',
  
  // Inverse colors
  inverseSurface: '#ffffff',
  onInverseSurface: '#000000',
  inversePrimary: '#a78bfa',
  
  // Glassmorphism colors
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassSurface: 'rgba(255, 255, 255, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.25)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient colors
  gradientStart: '#a855f7',
  gradientEnd: '#06b6d4',
  
  // Status bar
  statusBar: 'light-content',
};

interface ThemeContextType {
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

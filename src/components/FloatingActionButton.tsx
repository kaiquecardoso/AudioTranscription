import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
}

export default function FloatingActionButton({ 
  onPress, 
  icon = "add", 
  size = 32 
}: FloatingActionButtonProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[recordingScreenStyles.fab, {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
      }]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={size} color={theme.onPrimary} />
    </TouchableOpacity>
  );
}

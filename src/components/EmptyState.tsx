import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ 
  icon = "mic-off", 
  title, 
  subtitle 
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={recordingScreenStyles.emptyState}>
      <Ionicons name={icon as any} size={64} color={theme.onSurfaceVariant} />
      <Text style={[recordingScreenStyles.emptyText, { color: theme.onSurface }]}>
        {title}
      </Text>
      <Text style={[recordingScreenStyles.emptySubtext, { color: theme.onSurfaceVariant }]}>
        {subtitle}
      </Text>
    </View>
  );
}

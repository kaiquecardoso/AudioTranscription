import React from 'react';
import { Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';

interface RecordingHeaderProps {
  title: string;
}

export default function RecordingHeader({ title }: RecordingHeaderProps) {
  const { theme } = useTheme();

  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={[recordingScreenStyles.header, {
        borderBottomWidth: 1,
        borderBottomColor: theme.glassBorder,
        shadowColor: theme.glassShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }]}
    >
      <Text style={[recordingScreenStyles.headerTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
    </BlurView>
  );
}

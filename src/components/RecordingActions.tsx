import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';

interface RecordingActionsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onTranscribe: () => void;
}

export default function RecordingActions({ 
  isPlaying, 
  onPlay, 
  onTranscribe 
}: RecordingActionsProps) {
  const { theme } = useTheme();

  return (
    <View style={recordingScreenStyles.recordingActions}>
      <TouchableOpacity
        style={[recordingScreenStyles.actionButton, {
          backgroundColor: isPlaying ? theme.error : theme.primary,
          shadowColor: isPlaying ? theme.error : theme.primary,
        }]}
        onPress={onPlay}
      >
        <Ionicons 
          name={isPlaying ? "stop" : "play"} 
          size={20} 
          color={theme.onPrimary} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[recordingScreenStyles.actionButton, {
          backgroundColor: theme.secondary,
          shadowColor: theme.secondary,
        }]}
        onPress={onTranscribe}
      >
        <Ionicons name="text" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

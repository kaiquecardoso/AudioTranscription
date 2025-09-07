import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';

interface RecordingActionsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onTranscribe: () => void;
  isTranscribing?: boolean;
}

export default function RecordingActions({ 
  isPlaying, 
  onPlay, 
  onTranscribe,
  isTranscribing = false
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
          backgroundColor: isTranscribing ? theme.tertiary : theme.secondary,
          shadowColor: isTranscribing ? theme.tertiary : theme.secondary,
          opacity: isTranscribing ? 0.7 : 1,
        }]}
        onPress={onTranscribe}
        disabled={isTranscribing}
      >
        <Ionicons 
          name={isTranscribing ? "hourglass" : "text"} 
          size={20} 
          color={theme.onPrimary} 
        />
      </TouchableOpacity>
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingScreenStyles } from '../styles';
import { Recording } from '../types';
import { formatDateTime } from '../functions';
import RecordingActions from './RecordingActions';

interface RecordingItemProps {
  recording: Recording;
  isPlaying: boolean;
  onPlay: () => void;
  onTranscribe: () => void;
  onDelete: () => void;
}

export default function RecordingItem({
  recording,
  isPlaying,
  onPlay,
  onTranscribe,
  onDelete
}: RecordingItemProps) {
  const { theme } = useTheme();

  const renderRightActions = () => {
    return (
      <View style={recordingScreenStyles.rightActions}>
        <TouchableOpacity
          style={[recordingScreenStyles.deleteAction, { backgroundColor: theme.error }]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={24} color={theme.onError} />
          <Text style={[recordingScreenStyles.deleteActionText, { color: theme.onError }]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={[recordingScreenStyles.recordingItem, {
          borderBottomColor: theme.glassBorder,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }]}
      >
        <View style={recordingScreenStyles.recordingInfo}>
          <Text style={[recordingScreenStyles.recordingName, { color: theme.onSurface }]}>
            {recording.name}
          </Text>
          <Text style={[recordingScreenStyles.recordingDate, { color: theme.onSurfaceVariant }]}>
            {formatDateTime(recording.timestamp)}
          </Text>
          {recording.transcription && (
            <Text style={[recordingScreenStyles.transcriptionText, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
              {recording.transcription}
            </Text>
          )}
          {recording.summary && (
            <Text style={[recordingScreenStyles.summaryText, { color: theme.onSurfaceVariant }]} numberOfLines={3}>
              {recording.summary}
            </Text>
          )}
        </View>
        
        <RecordingActions
          isPlaying={isPlaying}
          onPlay={onPlay}
          onTranscribe={onTranscribe}
        />
      </BlurView>
    </Swipeable>
  );
}

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingModalStyles } from '../styles';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  uri: string | null;
  isTranscribing: boolean;
  isSaving: boolean;
  isPlaying: boolean;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording: () => void;
  onTranscribeRecording: () => void;
  onSaveRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  uri,
  isTranscribing,
  isSaving,
  isPlaying,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onPlayRecording,
  onTranscribeRecording,
  onSaveRecording,
}) => {
  const { theme } = useTheme();

  const ControlButton: React.FC<{
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    disabled?: boolean;
  }> = ({ onPress, icon, backgroundColor, disabled = false }) => (
    <TouchableOpacity
      style={[recordingModalStyles.controlButton, {
        backgroundColor: disabled ? theme.onSurfaceVariant : backgroundColor,
        shadowColor: disabled ? theme.onSurfaceVariant : backgroundColor,
      }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={24} color={theme.onPrimary} />
    </TouchableOpacity>
  );

  return (
    <View style={recordingModalStyles.controls}>
      {/* Durante gravação - pause e stop */}
      {isRecording && !isPaused && !uri && (
        <>
          <ControlButton
            onPress={onPauseRecording}
            icon="pause"
            backgroundColor={theme.secondary}
          />
          <ControlButton
            onPress={onStopRecording}
            icon="stop"
            backgroundColor={theme.error}
          />
        </>
      )}

      {/* Gravação pausada - play para continuar */}
      {isPaused && (
        <>
          <ControlButton
            onPress={onResumeRecording}
            icon="play"
            backgroundColor={theme.primary}
          />
          <ControlButton
            onPress={onStopRecording}
            icon="stop"
            backgroundColor={theme.error}
          />
        </>
      )}

      {/* Após gravação concluída */}
      {uri && !isRecording && (
        <>
          <ControlButton
            onPress={onPlayRecording}
            icon={isPlaying ? "pause" : "play"}
            backgroundColor={theme.secondary}
          />

          {!isTranscribing && (
            <ControlButton
              onPress={onTranscribeRecording}
              icon="analytics"
              backgroundColor={theme.primary}
            />
          )}

          <ControlButton
            onPress={onSaveRecording}
            icon="checkmark"
            backgroundColor={theme.tertiary}
            disabled={isSaving}
          />
        </>
      )}
    </View>
  );
};

export default RecordingControls;

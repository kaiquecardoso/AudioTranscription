import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { formatDuration } from '../functions';
import { recordingModalStyles } from '../styles';

interface RecordingAreaProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
  isTranscribing: boolean;
  isSaving: boolean;
  onStartRecording: () => void;
}

const RecordingArea: React.FC<RecordingAreaProps> = ({
  isRecording,
  isPaused,
  duration,
  uri,
  isTranscribing,
  isSaving,
  onStartRecording,
}) => {
  const { theme } = useTheme();

  const getStatusText = () => {
    if (isRecording && !isPaused) return 'Gravando...';
    if (isRecording && isPaused) return 'Gravação pausada';
    if (isTranscribing) return 'Processando áudio...';
    if (isSaving) return 'Salvando gravação...';
    if (uri) return 'Gravação concluída';
    return 'Toque no microfone para começar';
  };

  const handleMicrophonePress = () => {
    console.log('Botão de microfone pressionado');
    console.log('Estado atual - isRecording:', isRecording, 'uri:', uri, 'isPaused:', isPaused);
    
    if (!isRecording && !uri && !isPaused) {
      console.log('Iniciando gravação...');
      onStartRecording();
    } else {
      console.log('Gravação não pode ser iniciada - estado inválido');
    }
  };

  const getMicrophoneColor = () => {
    if (isRecording && !isPaused) return theme.error;
    if (isRecording && isPaused) return theme.secondary;
    return theme.primary;
  };

  const getShadowColor = () => {
    if (isRecording && !isPaused) return theme.error;
    if (isRecording && isPaused) return theme.secondary;
    return theme.primary;
  };

  return (
    <View style={recordingModalStyles.recordingArea}>
      <TouchableOpacity
        style={[recordingModalStyles.microphoneContainer, {
          backgroundColor: getMicrophoneColor(),
          shadowColor: getShadowColor(),
        }]}
        onPress={handleMicrophonePress}
        disabled={isRecording || !!uri}
      >
        <Ionicons 
          name={isRecording && isPaused ? "pause" : "mic"} 
          size={40} 
          color={theme.onPrimary} 
        />
      </TouchableOpacity>
      
      <Text style={[recordingModalStyles.durationText, { color: theme.onSurface }]}>
        {formatDuration(duration)}
      </Text>
      
      <Text style={[recordingModalStyles.statusText, { color: theme.onSurfaceVariant }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

export default RecordingArea;

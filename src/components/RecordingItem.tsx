import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
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
  onStop?: () => void; // Adicionar callback para parar
}

export default function RecordingItem({
  recording,
  isPlaying,
  onPlay,
  onTranscribe,
  onDelete,
  onStop
}: RecordingItemProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState(0);
  const [isContentMeasured, setIsContentMeasured] = useState(false);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  // Sincronizar estado local com prop
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);

  // Detectar quando a reprodução termina (simulação com timeout baseado na duração)
  useEffect(() => {
    if (localIsPlaying && recording.duration) {
      const durationMs = recording.duration * 1000; // Converter segundos para milissegundos
      const timeout = setTimeout(() => {
        console.log('Reprodução terminou automaticamente para:', recording.name);
        setLocalIsPlaying(false);
        if (onStop) {
          onStop();
        }
      }, durationMs);

      return () => clearTimeout(timeout);
    }
  }, [localIsPlaying, recording.duration, recording.name, onStop]);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animationValue, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const onContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && !isContentMeasured) {
      setContentHeight(height);
      setIsContentMeasured(true);
    }
  };

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
        style={[recordingScreenStyles.card, {
          borderColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
        }]}
      >
        {/* Row: DateTime + RecordingActions */}
        <View style={recordingScreenStyles.cardHeader}>
          <View style={recordingScreenStyles.dateTimeContainer}>
            <Text style={[recordingScreenStyles.recordingName, { color: theme.onSurface }]}>
              {recording.name}
            </Text>
            <Text style={[recordingScreenStyles.recordingDate, { color: theme.onSurfaceVariant }]}>
              {formatDateTime(recording.timestamp)}
            </Text>
          </View>
          <RecordingActions
            isPlaying={localIsPlaying}
            onPlay={onPlay}
            onTranscribe={onTranscribe}
          />
        </View>

        {/* Text: Transcription */}
        {recording.transcription && (
          <View style={recordingScreenStyles.transcriptionContainer}>
            <Text style={[recordingScreenStyles.transcriptionText, { color: theme.onSurfaceVariant }]}>
              {recording.transcription}
            </Text>
          </View>
        )}

        {/* Hidden content for measurement */}
        {recording.summary && !isContentMeasured && (
          <View 
            style={[recordingScreenStyles.summaryContainer, { position: 'absolute', opacity: 0 }]}
            onLayout={onContentLayout}
          >
            <Text style={[recordingScreenStyles.summaryText, { color: theme.onSurfaceVariant }]}>
              {recording.summary}
            </Text>
          </View>
        )}

        {/* Expandable Content: Summary */}
        {recording.summary && isContentMeasured && (
          <Animated.View 
            style={[
              recordingScreenStyles.expandableContent,
              {
                maxHeight: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, contentHeight],
                }),
                opacity: animationValue,
              }
            ]}
          >
            <View style={recordingScreenStyles.summaryContainer}>
              <Text style={[recordingScreenStyles.summaryText, { color: theme.onSurfaceVariant }]}>
                {recording.summary}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Footer: Ver resumo */}
        {recording.summary && (
          <TouchableOpacity 
            style={recordingScreenStyles.cardFooter}
            onPress={toggleExpanded}
            activeOpacity={0.7}
          >
            <Text style={[recordingScreenStyles.footerText, { color: theme.primary }]}>
              {isExpanded ? 'Ocultar resumo' : 'Ver resumo'}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        )}
      </BlurView>
    </Swipeable>
  );
}

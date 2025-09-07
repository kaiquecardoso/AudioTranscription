import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import RecordingModal from './RecordingModal';
import { useRecordings, useAudioPlayback } from '../hooks';
import { processRecording, formatDuration, formatDate, formatDateTime, createRecordingData } from '../functions';
import { recordingScreenStyles } from '../styles';
import { Recording } from '../types';

export default function RecordingScreen() {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { recordings, addRecording, updateRecording, deleteRecording } = useRecordings();
  const { isPlaying, currentPlayingId, playRecording, stopPlayback } = useAudioPlayback();

  const handlePlayRecording = async (recordingItem: Recording) => {
    try {
      // Verificar se a gravação ainda existe na lista
      const recordingExists = recordings.find(r => r.id === recordingItem.id);
      if (!recordingExists) {
        console.log('Gravação não encontrada na lista');
        return;
      }

      if (currentPlayingId === recordingItem.id) {
        stopPlayback();
      } else {
        playRecording(recordingItem.uri, recordingItem.id);
      }
    } catch (error) {
      console.error('Erro ao reproduzir:', error);
      Alert.alert('Erro', 'Falha ao reproduzir gravação');
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta gravação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Se a gravação que está tocando for a que está sendo excluída, parar o áudio
              if (currentPlayingId === recordingId) {
                stopPlayback();
              }
              
              await deleteRecording(recordingId);
            } catch (error) {
              console.error('Erro ao excluir gravação:', error);
              Alert.alert('Erro', 'Falha ao excluir gravação');
            }
          },
        },
      ]
    );
  };

  const handleTranscribeRecording = async (recording: Recording) => {
    try {
      const { transcription, summary } = await processRecording(recording.uri);
      updateRecording(recording.id, { transcription, summary });
    } catch (error) {
      console.error('Erro na transcrição:', error);
      Alert.alert('Erro', 'Falha ao transcrever gravação');
    }
  };

  const handleRecordingComplete = async (newRecording: Recording) => {
    addRecording(newRecording);
  };

  const renderRightActions = (recording: Recording) => {
    return (
      <View style={recordingScreenStyles.rightActions}>
        <TouchableOpacity
          style={[recordingScreenStyles.deleteAction, { backgroundColor: theme.error }]}
          onPress={() => handleDeleteRecording(recording.id)}
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
    <View style={[recordingScreenStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
          Gravações de Voz
        </Text>
      </BlurView>

      <ScrollView 
        style={recordingScreenStyles.scrollView}
        contentContainerStyle={recordingScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {recordings.length === 0 ? (
          <View style={recordingScreenStyles.emptyState}>
            <Ionicons name="mic-off" size={64} color={theme.onSurfaceVariant} />
            <Text style={[recordingScreenStyles.emptyText, { color: theme.onSurface }]}>
              Nenhuma gravação encontrada
            </Text>
            <Text style={[recordingScreenStyles.emptySubtext, { color: theme.onSurfaceVariant }]}>
              Toque no botão + para começar a gravar
            </Text>
          </View>
        ) : (
          recordings.map((recording) => (
            <Swipeable
              key={recording.id}
              renderRightActions={() => renderRightActions(recording)}
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
              
              <View style={recordingScreenStyles.recordingActions}>
                <TouchableOpacity
                  style={[recordingScreenStyles.actionButton, {
                    backgroundColor: currentPlayingId === recording.id ? theme.error : theme.primary,
                    shadowColor: currentPlayingId === recording.id ? theme.error : theme.primary,
                  }]}
                  onPress={() => handlePlayRecording(recording)}
                >
                  <Ionicons 
                    name={currentPlayingId === recording.id ? "stop" : "play"} 
                    size={20} 
                    color={theme.onPrimary} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[recordingScreenStyles.actionButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={() => handleTranscribeRecording(recording)}
                >
                  <Ionicons name="text" size={20} color={theme.onPrimary} />
                </TouchableOpacity>
              </View>
              </BlurView>
            </Swipeable>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[recordingScreenStyles.fab, {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
        }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={theme.onPrimary} />
      </TouchableOpacity>

      <RecordingModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </View>
  );
}
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import RecordingModal from './RecordingModal';
import { useRecordings, useAudioPlayback } from '../hooks';
import { processRecording } from '../functions';
import { recordingScreenStyles } from '../styles';
import { Recording } from '../types';
import { 
  RecordingHeader, 
  EmptyState, 
  RecordingItem, 
  FloatingActionButton 
} from '../components';

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


  return (
    <View style={[recordingScreenStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <RecordingHeader title="Gravações de Voz" />


        {recordings.length === 0 ? (
          <EmptyState
            title="Nenhuma gravação encontrada"
            subtitle="Toque no botão + para começar a gravar"
          />
        ) : (
          <ScrollView 
          style={recordingScreenStyles.scrollView}
          contentContainerStyle={recordingScreenStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {recordings.map((recording) => (
            <RecordingItem
              key={recording.id}
              recording={recording}
              isPlaying={currentPlayingId === recording.id}
              onPlay={() => handlePlayRecording(recording)}
              onTranscribe={() => handleTranscribeRecording(recording)}
              onDelete={() => handleDeleteRecording(recording.id)}
            />
          ))
          }
        </ScrollView>
        )}
     

      <FloatingActionButton onPress={() => setIsModalVisible(true)} />

      <RecordingModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </View>
  );
}
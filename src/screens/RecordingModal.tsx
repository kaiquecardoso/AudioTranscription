import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useRecording, useAudioPlayback } from '../hooks';
import { processRecording, createRecordingData } from '../functions';
import { recordingModalStyles } from '../styles';
import { RecordingModalProps } from '../types';
import RecordingModalHeader from '../components/RecordingModalHeader';
import RecordingArea from '../components/RecordingArea';
import TranscriptionSection from '../components/TranscriptionSection';
import RecordingControls from '../components/RecordingControls';

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  onClose,
  onRecordingComplete,
}) => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { 
    state, 
    recorderState, 
    startRecording, 
    pauseRecording, 
    resumeRecording, 
    stopRecording, 
    resetState, 
    updateState 
  } = useRecording();
  const { isPlaying, currentPlayingId, playRecording, stopPlayback } = useAudioPlayback();

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible, resetState]);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handlePauseRecording = async () => {
    await pauseRecording();
  };

  const handleResumeRecording = async () => {
    await resumeRecording();
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    // Iniciar transcrição automaticamente quando parar a gravação
    if (uri) {
      handleTranscribeRecording(uri);
    }
  };

  const handleTranscribeRecording = async (recordingUri: string) => {
    try {
      updateState({ isTranscribing: true });
      
      const { transcription, summary } = await processRecording(recordingUri);
      updateState({ transcription, summary });
      
    } catch (error) {
      console.error('Erro na transcrição:', error);
      Alert.alert('Erro', 'Falha ao processar gravação');
    } finally {
      updateState({ isTranscribing: false });
    }
  };

  const handlePlayRecording = async () => {
    if (!state.uri) return;

    if (currentPlayingId === state.uri) {
      stopPlayback();
    } else {
      playRecording(state.uri, state.uri);
    }
  };

  const handleSaveRecording = async () => {
    if (!state.uri) {
      Alert.alert('Erro', 'Nenhuma gravação para salvar');
      return;
    }

    try {
      // Se ainda está transcrevendo, aguardar a conclusão
      if (state.isTranscribing) {
        updateState({ isSaving: true });
        
        // Aguardar a transcrição terminar
        const checkTranscription = () => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (!state.isTranscribing) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        };
        
        await checkTranscription();
      }

      const fileName = `recording_${Date.now()}.m4a`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Verificar se o arquivo de origem existe
      const sourceInfo = await FileSystem.getInfoAsync(state.uri);
      console.log('Verificando arquivo origem:', sourceInfo);
      
      if (!sourceInfo.exists) {
        console.log('Arquivo não encontrado, mas tentando continuar...');
      }

      // Garantir que o diretório de destino existe
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory!);
      }

      // Tentar copyAsync primeiro, se falhar usar moveAsync
      try {
        await FileSystem.copyAsync({
          from: state.uri,
          to: fileUri,
        });
      } catch (copyError) {
        console.log('Copy falhou, tentando move:', copyError);
        await FileSystem.moveAsync({
          from: state.uri,
          to: fileUri,
        });
      }

      const recordingData = createRecordingData(
        fileUri,
        state.duration,
        state.transcription,
        state.summary
      );

      onRecordingComplete(recordingData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao salvar gravação: ${errorMessage}`);
    } finally {
      updateState({ isSaving: false });
    }
  };

  const handleClose = () => {
    if (recorderState.isRecording) {
      Alert.alert(
        'Gravação em andamento',
        'Deseja realmente cancelar a gravação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim', onPress: () => {
            handleStopRecording();
            onClose();
          }},
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[recordingModalStyles.container, { backgroundColor: theme.background }]}>
        <RecordingModalHeader onClose={handleClose} />

        <ScrollView 
          style={recordingModalStyles.scrollView}
          contentContainerStyle={recordingModalStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RecordingArea
            isRecording={recorderState.isRecording}
            isPaused={state.isPaused}
            duration={state.duration}
            uri={state.uri}
            isTranscribing={state.isTranscribing}
            isSaving={state.isSaving}
            onStartRecording={handleStartRecording}
          />

          <TranscriptionSection
            transcription={state.transcription}
            summary={state.summary}
            isSummaryExpanded={state.isSummaryExpanded}
            onToggleSummary={() => updateState({ isSummaryExpanded: !state.isSummaryExpanded })}
          />

          <RecordingControls
            isRecording={recorderState.isRecording}
            isPaused={state.isPaused}
            uri={state.uri}
            isTranscribing={state.isTranscribing}
            isSaving={state.isSaving}
            isPlaying={isPlaying}
            onPauseRecording={handlePauseRecording}
            onResumeRecording={handleResumeRecording}
            onStopRecording={handleStopRecording}
            onPlayRecording={handlePlayRecording}
            onTranscribeRecording={() => state.uri && handleTranscribeRecording(state.uri)}
            onSaveRecording={handleSaveRecording}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RecordingModal;

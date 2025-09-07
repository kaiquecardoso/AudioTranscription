import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useRecording, useAudioPlayback } from '../hooks';
import { processRecording, formatDuration, createRecordingData } from '../functions';
import { recordingModalStyles } from '../styles';
import { RecordingModalProps } from '../types';

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
        <BlurView
          intensity={80}
          tint="dark"
          style={[recordingModalStyles.header, {
            borderBottomWidth: 1,
            borderBottomColor: theme.glassBorder,
            shadowColor: theme.glassShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }]}
        >
          <TouchableOpacity onPress={handleClose} style={recordingModalStyles.closeButton}>
            <Ionicons name="close" size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[recordingModalStyles.headerTitle, { color: theme.onSurface }]}>
            Gravação de Voz
          </Text>
          <View style={recordingModalStyles.placeholder} />
        </BlurView>

        <ScrollView 
          style={recordingModalStyles.scrollView}
          contentContainerStyle={recordingModalStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={recordingModalStyles.recordingArea}>
            <TouchableOpacity
              style={[recordingModalStyles.microphoneContainer, {
                backgroundColor: recorderState.isRecording && !state.isPaused ? theme.error : 
                                recorderState.isRecording && state.isPaused ? theme.secondary :
                                theme.primary,
                shadowColor: recorderState.isRecording && !state.isPaused ? theme.error : 
                            recorderState.isRecording && state.isPaused ? theme.secondary :
                            theme.primary,
              }]}
              onPress={!recorderState.isRecording && !state.uri && !state.isPaused ? handleStartRecording : undefined}
              disabled={recorderState.isRecording || !!state.uri}
            >
              <Ionicons 
                name={recorderState.isRecording && state.isPaused ? "pause" : "mic"} 
                size={40} 
                color={theme.onPrimary} 
              />
            </TouchableOpacity>
            
            <Text style={[recordingModalStyles.durationText, { color: theme.onSurface }]}>
              {formatDuration(state.duration)}
            </Text>
            
            <Text style={[recordingModalStyles.statusText, { color: theme.onSurfaceVariant }]}>
              {recorderState.isRecording && !state.isPaused ? 'Gravando...' : 
               recorderState.isRecording && state.isPaused ? 'Gravação pausada' :
               state.isTranscribing ? 'Processando áudio...' : 
               state.isSaving ? 'Salvando gravação...' :
               state.uri ? 'Gravação concluída' : 
               'Toque no microfone para começar'}
            </Text>
          </View>

          {state.transcription && (
            <View style={[recordingModalStyles.transcriptionContainer, {
              backgroundColor: theme.surface,
              borderColor: theme.glassBorder,
            }]}>
              <TouchableOpacity
                style={recordingModalStyles.transcriptionHeader}
                onPress={() => updateState({ isSummaryExpanded: !state.isSummaryExpanded })}
                activeOpacity={0.7}
              >
                <Text style={[recordingModalStyles.transcriptionTitle, { color: theme.onSurface }]}>
                  Transcrição
                </Text>
                <Ionicons 
                  name={state.isSummaryExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.onSurface} 
                />
              </TouchableOpacity>
              
              <Text style={[recordingModalStyles.transcriptionText, { color: theme.onSurfaceVariant }]}>
                {state.transcription}
              </Text>
              
              {state.summary && (
                <View style={recordingModalStyles.summarySection}>
                  <Text style={[recordingModalStyles.summaryTitle, { color: theme.onSurface }]}>
                    Resumo do Conteúdo
                  </Text>
                  
                  {state.isSummaryExpanded && (
                    <Text style={[recordingModalStyles.summaryText, { color: theme.onSurfaceVariant }]}>
                      {state.summary}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={recordingModalStyles.controls}>
            {/* Durante gravação - pause e stop */}
            {recorderState.isRecording && !state.isPaused && !state.uri && (
              <>
                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={handlePauseRecording}
                >
                  <Ionicons name="pause" size={24} color={theme.onPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: theme.error,
                    shadowColor: theme.error,
                  }]}
                  onPress={handleStopRecording}
                >
                  <Ionicons name="stop" size={24} color={theme.onPrimary} />
                </TouchableOpacity>
              </>
            )}

            {/* Gravação pausada - play para continuar */}
            {state.isPaused && (
              <>
                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                  }]}
                  onPress={handleResumeRecording}
                >
                  <Ionicons name="play" size={24} color={theme.onPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: theme.error,
                    shadowColor: theme.error,
                  }]}
                  onPress={handleStopRecording}
                >
                  <Ionicons name="stop" size={24} color={theme.onPrimary} />
                </TouchableOpacity>
              </>
            )}

            {/* Após gravação concluída */}
            {state.uri && !recorderState.isRecording && (
              <>
                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={handlePlayRecording}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={24} 
                    color={theme.onPrimary} 
                  />
                </TouchableOpacity>

                {!state.transcription && !state.isTranscribing && (
                  <TouchableOpacity
                    style={[recordingModalStyles.controlButton, {
                      backgroundColor: theme.primary,
                      shadowColor: theme.primary,
                    }]}
                    onPress={() => state.uri && handleTranscribeRecording(state.uri)}
                  >
                    <Ionicons name="analytics" size={24} color={theme.onPrimary} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[recordingModalStyles.controlButton, {
                    backgroundColor: state.isSaving ? theme.onSurfaceVariant : theme.tertiary,
                    shadowColor: state.isSaving ? theme.onSurfaceVariant : theme.tertiary,
                  }]}
                  onPress={handleSaveRecording}
                  disabled={state.isSaving}
                >
                  <Ionicons name="checkmark" size={24} color={theme.onPrimary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RecordingModal;

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  useAudioRecorder, 
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync
} from 'expo-audio';
import { RecordingState } from '../types';

export const useRecording = () => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    uri: null,
    isPlaying: false,
    currentPlayingId: null,
    transcription: '',
    summary: '',
    isTranscribing: false,
    isSummaryExpanded: false,
    isSaving: false,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recorderState.isRecording) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recorderState.isRecording]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Erro', 'Permissão para acessar o microfone foi negada');
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Erro ao configurar áudio:', error);
      }
    };

    setupAudio();
  }, []);

  const startRecording = async () => {
    try {
      console.log('Preparando gravação...');
      await recorder.prepareToRecordAsync();
      console.log('Iniciando gravação...');
      recorder.record();
      console.log('Gravação iniciada com sucesso');
      setState(prev => ({ ...prev, duration: 0, isRecording: true }));
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao iniciar gravação: ${errorMessage}`);
    }
  };

  const pauseRecording = async () => {
    try {
      console.log('Pausando gravação...');
      await recorder.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Erro ao pausar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao pausar gravação: ${errorMessage}`);
    }
  };

  const resumeRecording = async () => {
    try {
      console.log('Retomando gravação...');
      recorder.record();
      setState(prev => ({ ...prev, isPaused: false }));
    } catch (error) {
      console.error('Erro ao retomar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao retomar gravação: ${errorMessage}`);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Parando gravação...');
      await recorder.stop();
      
      const uri = recorder.uri;
      console.log('URI da gravação:', uri);
      
      if (!uri) {
        throw new Error('URI da gravação não foi gerado');
      }
      
      setState(prev => ({ 
        ...prev, 
        uri, 
        isPaused: false, 
        isRecording: false 
      }));
      
      return uri;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao parar gravação: ${errorMessage}`);
      return null;
    }
  };

  const resetState = useCallback(() => {
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      uri: null,
      isPlaying: false,
      currentPlayingId: null,
      transcription: '',
      summary: '',
      isTranscribing: false,
      isSummaryExpanded: false,
      isSaving: false,
    });
  }, []);

  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    recorderState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetState,
    updateState,
  };
};

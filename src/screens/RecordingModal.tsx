import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { 
  useAudioPlayer, 
  useAudioRecorder, 
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { API_CONFIG } from '../config/api';

const { width, height } = Dimensions.get('window');

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: (recording: any) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  onClose,
  onRecordingComplete,
}) => {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const player = useAudioPlayer();
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recorderState.isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recorderState.isRecording]);

  useEffect(() => {
    // Configurar permissões e modo de áudio
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

  useEffect(() => {
    if (visible) {
      // Resetar estado quando o modal abrir
      setRecordingDuration(0);
      setRecordingUri(null);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPlayingId(null);
      setTranscription('');
      setSummary('');
      setIsTranscribing(false);
      setIsSummaryExpanded(false);
      player.pause();
    }
  }, [visible]);

  const startRecording = async () => {
    try {
      console.log('Preparando gravação...');
      await recorder.prepareToRecordAsync();
      console.log('Iniciando gravação...');
      recorder.record();
      console.log('Gravação iniciada com sucesso');
      setRecordingDuration(0);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao iniciar gravação: ${errorMessage}`);
    }
  };

  const pauseRecording = async () => {
    try {
      console.log('Pausando gravação...');
      console.log('Estado antes da pausa - isRecording:', recorderState.isRecording, 'isPaused:', isPaused);
      await recorder.pause();
      setIsPaused(true);
      console.log('Estado após pausa - isRecording:', recorderState.isRecording, 'isPaused:', true);
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
      setIsPaused(false);
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
      
      // Verificar se o URI foi gerado corretamente
      if (!uri) {
        throw new Error('URI da gravação não foi gerado');
      }
      
      setRecordingUri(uri);
      setIsPaused(false);
      
      // Iniciar transcrição automaticamente apenas se habilitado nas configurações
      if (settings.autoTranscription) {
        transcribeRecording(uri);
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao parar gravação: ${errorMessage}`);
    }
  };

  const transcribeRecording = async (recordingUri: string) => {
    try {
      setIsTranscribing(true);
      
      // 1. Fazer transcrição do áudio
      const formData = new FormData();
      formData.append('file', {
        uri: recordingUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha na transcrição');
      }

      const data = await response.json();
      const transcriptionText = data.text;
      setTranscription(transcriptionText);

      // 2. Gerar resumo do conteúdo
      const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analise o seguinte áudio transcrito e crie um resumo estruturado em português. Inclua:\n1. Tópicos principais discutidos\n2. Pontos-chave mencionados\n3. Conclusões ou decisões tomadas\n4. Ações ou próximos passos sugeridos\n\nFormate como um resumo executivo claro e organizado.',
            },
            {
              role: 'user',
              content: `Conteúdo do áudio transcrito:\n\n${transcriptionText}`,
            },
          ],
          max_tokens: 300,
        }),
      });

      const summaryData = await summaryResponse.json();
      const summaryText = summaryData.choices[0].message.content;
      setSummary(summaryText);
      
    } catch (error) {
      console.error('Erro na transcrição:', error);
      Alert.alert('Erro', 'Falha ao processar gravação');
    } finally {
      setIsTranscribing(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      player.replace(recordingUri);
      player.play();
      
      setIsPlaying(true);
      setCurrentPlayingId(recordingUri);
    } catch (error) {
      console.error('Erro ao reproduzir:', error);
      Alert.alert('Erro', 'Falha ao reproduzir gravação');
    }
  };

  const stopPlayback = async () => {
    player.pause();
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const saveRecording = async () => {
    if (!recordingUri) {
      Alert.alert('Erro', 'Nenhuma gravação para salvar');
      return;
    }

    try {
      const fileName = `recording_${Date.now()}.m4a`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Verificar se o arquivo de origem existe
      const sourceInfo = await FileSystem.getInfoAsync(recordingUri);
      console.log('Verificando arquivo origem:', sourceInfo);
      
      if (!sourceInfo.exists) {
        console.log('Arquivo não encontrado, mas tentando continuar...');
        // Vamos tentar continuar mesmo assim
      }

      // Garantir que o diretório de destino existe
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory!);
      }

      // Tentar copyAsync primeiro, se falhar usar moveAsync
      try {
        await FileSystem.copyAsync({
          from: recordingUri,
          to: fileUri,
        });
      } catch (copyError) {
        console.log('Copy falhou, tentando move:', copyError);
        await FileSystem.moveAsync({
          from: recordingUri,
          to: fileUri,
        });
      }

      const recordingData = {
        id: Date.now().toString(),
        uri: fileUri,
        duration: recordingDuration,
        transcription: transcription,
        summary: summary,
        timestamp: new Date().toISOString(),
        name: `Gravação ${new Date().toLocaleDateString('pt-BR')}`,
      };

      onRecordingComplete(recordingData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', `Falha ao salvar gravação: ${errorMessage}`);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (recorderState.isRecording) {
      Alert.alert(
        'Gravação em andamento',
        'Deseja realmente cancelar a gravação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim', onPress: () => {
            stopRecording();
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <BlurView
          intensity={80}
          tint="dark"
          style={[styles.header, {
            borderBottomWidth: 1,
            borderBottomColor: theme.glassBorder,
            shadowColor: theme.glassShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>
            Gravação de Voz
          </Text>
          <View style={styles.placeholder} />
        </BlurView>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recordingArea}>
            <TouchableOpacity
              style={[styles.microphoneContainer, {
                backgroundColor: recorderState.isRecording && !isPaused ? theme.error : 
                                recorderState.isRecording && isPaused ? theme.secondary :
                                theme.primary,
                shadowColor: recorderState.isRecording && !isPaused ? theme.error : 
                            recorderState.isRecording && isPaused ? theme.secondary :
                            theme.primary,
              }]}
              onPress={!recorderState.isRecording && !recordingUri && !isPaused ? startRecording : undefined}
              disabled={recorderState.isRecording || !!recordingUri}
            >
              <Ionicons 
                name={recorderState.isRecording && isPaused ? "pause" : "mic"} 
                size={40} 
                color={theme.onPrimary} 
              />
            </TouchableOpacity>
            
            <Text style={[styles.durationText, { color: theme.onSurface }]}>
              {formatDuration(recordingDuration)}
            </Text>
            
            <Text style={[styles.statusText, { color: theme.onSurfaceVariant }]}>
              {recorderState.isRecording && !isPaused ? 'Gravando...' : 
               recorderState.isRecording && isPaused ? 'Gravação pausada' :
               isTranscribing ? 'Processando áudio...' : 
               recordingUri ? 'Gravação concluída' : 
               'Toque no microfone para começar'}
            </Text>
          </View>

          {transcription && (
            <View style={[styles.transcriptionContainer, {
              backgroundColor: theme.surface,
              borderColor: theme.glassBorder,
            }]}>
              <TouchableOpacity
                style={styles.transcriptionHeader}
                onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                activeOpacity={0.7}
              >
                <Text style={[styles.transcriptionTitle, { color: theme.onSurface }]}>
                  Transcrição
                </Text>
                <Ionicons 
                  name={isSummaryExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.onSurface} 
                />
              </TouchableOpacity>
              
              <Text style={[styles.transcriptionText, { color: theme.onSurfaceVariant }]}>
                {transcription}
              </Text>
              
              {summary && (
                <View style={styles.summarySection}>
                  <Text style={[styles.summaryTitle, { color: theme.onSurface }]}>
                    Resumo do Conteúdo
                  </Text>
                  
                  {isSummaryExpanded && (
                    <Text style={[styles.summaryText, { color: theme.onSurfaceVariant }]}>
                      {summary}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.controls}>
            {/* Durante gravação - pause e stop */}
            {recorderState.isRecording && !isPaused && !recordingUri && (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={pauseRecording}
                >
                  <Ionicons name="pause" size={24} color={theme.onPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.error,
                    shadowColor: theme.error,
                  }]}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={24} color={theme.onPrimary} />
                </TouchableOpacity>
              </>
            )}

            {/* Gravação pausada - play para continuar */}
            {isPaused && (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                  }]}
                  onPress={resumeRecording}
                >
                  <Ionicons name="play" size={24} color={theme.onPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.error,
                    shadowColor: theme.error,
                  }]}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={24} color={theme.onPrimary} />
                </TouchableOpacity>
              </>
            )}

            {/* Após gravação concluída */}
            {recordingUri && !recorderState.isRecording && (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={isPlaying ? stopPlayback : playRecording}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={24} 
                    color={theme.onPrimary} 
                  />
                </TouchableOpacity>

                {!transcription && !isTranscribing && (
                  <TouchableOpacity
                    style={[styles.controlButton, {
                      backgroundColor: theme.primary,
                      shadowColor: theme.primary,
                    }]}
                    onPress={() => recordingUri && transcribeRecording(recordingUri)}
                  >
                    <Ionicons name="analytics" size={24} color={theme.onPrimary} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.controlButton, {
                    backgroundColor: theme.tertiary,
                    shadowColor: theme.tertiary,
                  }]}
                  onPress={saveRecording}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  microphoneContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  transcriptionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  summarySection: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default RecordingModal;

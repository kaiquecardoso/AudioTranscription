import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import RecordingModal from './RecordingModal';
import { API_CONFIG } from '../config/api';

interface Recording {
  id: string;
  uri: string;
  duration: number;
  transcription: string;
  summary: string;
  timestamp: string;
  name: string;
}

export default function RecordingScreen() {
  const { theme } = useTheme();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const player = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      const recordingFiles = files.filter(file => file.endsWith('.m4a'));
      
      const recordingsData = await Promise.all(
        recordingFiles.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          const stat = await FileSystem.getInfoAsync(fileUri);
          
          return {
            id: file,
            uri: fileUri,
            duration: 0, // Will be calculated when playing
            transcription: '',
            summary: '',
            timestamp: stat.exists ? new Date(stat.modificationTime! * 1000).toISOString() : new Date().toISOString(),
            name: `Gravação ${new Date().toLocaleDateString('pt-BR')}`,
          };
        })
      );
      
      setRecordings(recordingsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
    }
  };

  const playRecording = async (recordingItem: Recording) => {
    try {
      // Verificar se a gravação ainda existe na lista
      const recordingExists = recordings.find(r => r.id === recordingItem.id);
      if (!recordingExists) {
        console.log('Gravação não encontrada na lista');
        return;
      }

      player.replace(recordingItem.uri);
      player.play();
      
      setIsPlaying(true);
      setCurrentPlayingId(recordingItem.id);
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

  const deleteRecording = async (recordingId: string) => {
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
                player.pause();
                setIsPlaying(false);
                setCurrentPlayingId(null);
              }
              
              const recording = recordings.find(r => r.id === recordingId);
              if (recording) {
                await FileSystem.deleteAsync(recording.uri);
                setRecordings(prev => prev.filter(r => r.id !== recordingId));
              }
            } catch (error) {
              console.error('Erro ao excluir gravação:', error);
              Alert.alert('Erro', 'Falha ao excluir gravação');
            }
          },
        },
      ]
    );
  };

  const transcribeRecording = async (recording: Recording) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: recording.uri,
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
      const transcription = data.text;

      // Generate summary
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
              content: 'Resuma o seguinte texto de forma concisa em português:',
            },
            {
              role: 'user',
              content: transcription,
            },
          ],
          max_tokens: 150,
        }),
      });

      const summaryData = await summaryResponse.json();
      const summary = summaryData.choices[0].message.content;

      // Update recording with transcription and summary
      setRecordings(prev => 
        prev.map(r => 
          r.id === recording.id 
            ? { ...r, transcription, summary }
            : r
        )
      );
    } catch (error) {
      console.error('Erro na transcrição:', error);
      Alert.alert('Erro', 'Falha ao transcrever gravação');
    }
  };

  const handleRecordingComplete = async (newRecording: any) => {
    setRecordings(prev => [newRecording, ...prev]);
    
    // Auto-transcribe the new recording
    setTimeout(() => {
      transcribeRecording(newRecording);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRightActions = (recording: Recording) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: theme.error }]}
          onPress={() => deleteRecording(recording.id)}
        >
          <Ionicons name="trash" size={24} color={theme.onError} />
          <Text style={[styles.deleteActionText, { color: theme.onError }]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
        <Text style={[styles.headerTitle, { color: theme.onSurface }]}>
          Gravações de Voz
        </Text>
      </BlurView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {recordings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mic-off" size={64} color={theme.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: theme.onSurface }]}>
              Nenhuma gravação encontrada
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.onSurfaceVariant }]}>
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
                style={[styles.recordingItem, {
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
              <View style={styles.recordingInfo}>
                <Text style={[styles.recordingName, { color: theme.onSurface }]}>
                  {recording.name}
                </Text>
                <Text style={[styles.recordingDate, { color: theme.onSurfaceVariant }]}>
                  {formatDate(recording.timestamp)}
                </Text>
                {recording.transcription && (
                  <Text style={[styles.transcriptionText, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
                    {recording.transcription}
                  </Text>
                )}
                {recording.summary && (
                  <Text style={[styles.summaryText, { color: theme.onSurfaceVariant }]} numberOfLines={3}>
                    {recording.summary}
                  </Text>
                )}
              </View>
              
              <View style={styles.recordingActions}>
                <TouchableOpacity
                  style={[styles.actionButton, {
                    backgroundColor: currentPlayingId === recording.id ? theme.error : theme.primary,
                    shadowColor: currentPlayingId === recording.id ? theme.error : theme.primary,
                  }]}
                  onPress={() => {
                    if (currentPlayingId === recording.id) {
                      stopPlayback();
                    } else {
                      playRecording(recording);
                    }
                  }}
                >
                  <Ionicons 
                    name={currentPlayingId === recording.id ? "stop" : "play"} 
                    size={20} 
                    color={theme.onPrimary} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, {
                    backgroundColor: theme.secondary,
                    shadowColor: theme.secondary,
                  }]}
                  onPress={() => transcribeRecording(recording)}
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
        style={[styles.fab, {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  recordingItem: {
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 120,
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 4,
  },
  recordingInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    marginHorizontal: 8,
  },
  deleteAction: {
    width: 80,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
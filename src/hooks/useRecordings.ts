import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Recording } from '../types';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

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

  const addRecording = (recording: Recording) => {
    setRecordings(prev => [recording, ...prev]);
  };

  const updateRecording = (id: string, updates: Partial<Recording>) => {
    setRecordings(prev => 
      prev.map(r => 
        r.id === id ? { ...r, ...updates } : r
      )
    );
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const recording = recordings.find(r => r.id === recordingId);
      if (recording) {
        await FileSystem.deleteAsync(recording.uri);
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
      }
    } catch (error) {
      console.error('Erro ao excluir gravação:', error);
      Alert.alert('Erro', 'Falha ao excluir gravação');
    }
  };

  const clearAllRecordings = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      const recordingFiles = files.filter(file => file.endsWith('.m4a'));
      
      await Promise.all(
        recordingFiles.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          await FileSystem.deleteAsync(fileUri);
        })
      );
      
      setRecordings([]);
    } catch (error) {
      console.error('Erro ao limpar gravações:', error);
      Alert.alert('Erro', 'Falha ao limpar gravações');
    }
  };

  return {
    recordings,
    loadRecordings,
    addRecording,
    updateRecording,
    deleteRecording,
    clearAllRecordings,
  };
};

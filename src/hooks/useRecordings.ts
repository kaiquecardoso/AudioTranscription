import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Recording } from '../types';
import { PersistenceService } from '../services';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      const recordingFiles = files.filter(file => file.endsWith('.m4a'));
      
      // Carregar todos os metadados persistidos
      const allMetadata = await PersistenceService.loadAllMetadata();
      
      const recordingsData = await Promise.all(
        recordingFiles.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          const stat = await FileSystem.getInfoAsync(fileUri);
          const fileId = file.replace('.m4a', '');
          
          // Buscar metadados persistidos para este arquivo
          const metadata = allMetadata[fileId] || {};
          
          return {
            id: fileId,
            uri: fileUri,
            duration: metadata.duration || 0,
            transcription: metadata.transcription || '',
            summary: metadata.summary || '',
            timestamp: stat.exists ? new Date(stat.modificationTime! * 1000).toISOString() : new Date().toISOString(),
            name: metadata.name || `Gravação ${new Date().toLocaleDateString('pt-BR')}`,
          };
        })
      );
      
      setRecordings(recordingsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
    }
  };

  const addRecording = async (recording: Recording) => {
    try {
      // Persistir metadados
      await PersistenceService.saveRecordingMetadata(recording);
      
      // Adicionar à lista local
      setRecordings(prev => [recording, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar gravação:', error);
      Alert.alert('Erro', 'Falha ao salvar gravação');
    }
  };

  const updateRecording = async (id: string, updates: Partial<Recording>) => {
    try {
      // Atualizar na lista local
      setRecordings(prev => 
        prev.map(r => 
          r.id === id ? { ...r, ...updates } : r
        )
      );

      // Buscar a gravação atualizada e persistir
      const updatedRecording = recordings.find(r => r.id === id);
      if (updatedRecording) {
        const finalRecording = { ...updatedRecording, ...updates };
        await PersistenceService.saveRecordingMetadata(finalRecording);
      }
    } catch (error) {
      console.error('Erro ao atualizar gravação:', error);
      Alert.alert('Erro', 'Falha ao atualizar gravação');
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const recording = recordings.find(r => r.id === recordingId);
      if (recording) {
        // Deletar arquivo de áudio
        await FileSystem.deleteAsync(recording.uri);
        
        // Deletar metadados
        await PersistenceService.deleteRecordingMetadata(recordingId);
        
        // Remover da lista local
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
      
      // Deletar todos os arquivos de áudio
      await Promise.all(
        recordingFiles.map(async (file) => {
          const fileUri = `${FileSystem.documentDirectory}${file}`;
          await FileSystem.deleteAsync(fileUri);
        })
      );
      
      // Limpar todos os metadados
      await PersistenceService.clearAllMetadata();
      
      // Limpar lista local
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

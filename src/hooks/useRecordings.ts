import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Recording } from '../types';
import { PersistenceService } from '../services';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Carregar gravações diretamente do banco SQLite
      const allRecordings = await PersistenceService.loadAllRecordings();
      
      // Verificar se os arquivos de áudio ainda existem
      const validRecordings = await Promise.all(
        allRecordings.map(async (recording) => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(recording.uri);
            if (fileInfo.exists) {
              return recording;
            } else {
              console.warn(`Arquivo de áudio não encontrado: ${recording.uri}`);
              // Opcional: remover do banco se arquivo não existe
              // await PersistenceService.deleteRecording(recording.id);
              return null;
            }
          } catch (error) {
            console.error(`Erro ao verificar arquivo ${recording.uri}:`, error);
            return null;
          }
        })
      );
      
      // Filtrar gravações válidas (com arquivos existentes)
      const validRecordingsList = validRecordings.filter(recording => recording !== null) as Recording[];
      
      setRecordings(validRecordingsList);
      console.log(`Carregadas ${validRecordingsList.length} gravações do banco SQLite`);
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
      setError('Falha ao carregar gravações do banco de dados');
    } finally {
      setIsLoading(false);
    }
  };

  const addRecording = async (recording: Recording) => {
    try {
      // Salvar no banco SQLite
      await PersistenceService.saveRecording(recording);
      
      // Adicionar à lista local
      setRecordings(prev => [recording, ...prev]);
      console.log('Gravação salva no banco SQLite:', recording.id);
    } catch (error) {
      console.error('Erro ao adicionar gravação:', error);
      setError('Falha ao salvar gravação no banco de dados');
      Alert.alert('Erro', 'Falha ao salvar gravação');
    }
  };

  const updateRecording = async (id: string, updates: Partial<Recording>) => {
    try {
      // Atualizar no banco SQLite
      await PersistenceService.updateRecording(id, updates);
      
      // Atualizar na lista local
      setRecordings(prev => 
        prev.map(r => 
          r.id === id ? { ...r, ...updates } : r
        )
      );
      
      console.log('Gravação atualizada no banco SQLite:', id);
    } catch (error) {
      console.error('Erro ao atualizar gravação:', error);
      setError('Falha ao atualizar gravação no banco de dados');
      Alert.alert('Erro', 'Falha ao atualizar gravação');
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const recording = recordings.find(r => r.id === recordingId);
      if (recording) {
        // Deletar arquivo de áudio
        try {
          await FileSystem.deleteAsync(recording.uri);
        } catch (fileError) {
          console.warn('Arquivo de áudio não encontrado ou já deletado:', recording.uri);
        }
        
        // Deletar do banco SQLite
        await PersistenceService.deleteRecording(recordingId);
        
        // Remover da lista local
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
        
        console.log('Gravação deletada do banco SQLite:', recordingId);
      }
    } catch (error) {
      console.error('Erro ao excluir gravação:', error);
      setError('Falha ao excluir gravação do banco de dados');
      Alert.alert('Erro', 'Falha ao excluir gravação');
    }
  };

  const clearAllRecordings = async () => {
    try {
      // Deletar todos os arquivos de áudio das gravações atuais
      await Promise.all(
        recordings.map(async (recording) => {
          try {
            await FileSystem.deleteAsync(recording.uri);
          } catch (fileError) {
            console.warn('Arquivo não encontrado:', recording.uri);
          }
        })
      );
      
      // Limpar banco SQLite
      await PersistenceService.clearAllRecordings();
      
      // Limpar lista local
      setRecordings([]);
      console.log('Todas as gravações foram limpas do banco SQLite');
    } catch (error) {
      console.error('Erro ao limpar gravações:', error);
      setError('Falha ao limpar gravações do banco de dados');
      Alert.alert('Erro', 'Falha ao limpar gravações');
    }
  };

  return {
    recordings,
    isLoading,
    error,
    loadRecordings,
    addRecording,
    updateRecording,
    deleteRecording,
    clearAllRecordings,
    clearError: () => setError(null),
  };
};

import { useState, useEffect, useCallback } from 'react';
import { PersistenceService } from '../services';
import { Recording } from '../types';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar banco de dados
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await PersistenceService.initialize();
      setIsInitialized(true);
      console.log('Banco de dados inicializado com sucesso');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao inicializar banco: ${errorMessage}`);
      console.error('Erro ao inicializar banco:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar todas as gravações
  const loadRecordings = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const allRecordings = await PersistenceService.loadAllRecordings();
      setRecordings(allRecordings);
      console.log(`Carregadas ${allRecordings.length} gravações`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao carregar gravações: ${errorMessage}`);
      console.error('Erro ao carregar gravações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Salvar gravação
  const saveRecording = useCallback(async (recording: Recording) => {
    if (!isInitialized) return false;
    
    try {
      setError(null);
      await PersistenceService.saveRecording(recording);
      
      // Atualizar lista local
      setRecordings(prev => [recording, ...prev]);
      console.log('Gravação salva:', recording.id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao salvar gravação: ${errorMessage}`);
      console.error('Erro ao salvar gravação:', err);
      return false;
    }
  }, [isInitialized]);

  // Atualizar gravação
  const updateRecording = useCallback(async (id: string, updates: Partial<Recording>) => {
    if (!isInitialized) return false;
    
    try {
      setError(null);
      await PersistenceService.updateRecording(id, updates);
      
      // Atualizar lista local
      setRecordings(prev => 
        prev.map(recording => 
          recording.id === id 
            ? { ...recording, ...updates }
            : recording
        )
      );
      console.log('Gravação atualizada:', id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao atualizar gravação: ${errorMessage}`);
      console.error('Erro ao atualizar gravação:', err);
      return false;
    }
  }, [isInitialized]);

  // Deletar gravação
  const deleteRecording = useCallback(async (id: string) => {
    if (!isInitialized) return false;
    
    try {
      setError(null);
      await PersistenceService.deleteRecording(id);
      
      // Atualizar lista local
      setRecordings(prev => prev.filter(recording => recording.id !== id));
      console.log('Gravação deletada:', id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao deletar gravação: ${errorMessage}`);
      console.error('Erro ao deletar gravação:', err);
      return false;
    }
  }, [isInitialized]);

  // Buscar gravações
  const searchRecordings = useCallback(async (searchTerm: string) => {
    if (!isInitialized) return [];
    
    try {
      setError(null);
      const results = await PersistenceService.searchRecordings(searchTerm);
      console.log(`Encontradas ${results.length} gravações para: "${searchTerm}"`);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao buscar gravações: ${errorMessage}`);
      console.error('Erro ao buscar gravações:', err);
      return [];
    }
  }, [isInitialized]);

  // Obter estatísticas
  const getStats = useCallback(async () => {
    if (!isInitialized) return { total: 0, totalDuration: 0 };
    
    try {
      setError(null);
      const stats = await PersistenceService.getStats();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao obter estatísticas: ${errorMessage}`);
      console.error('Erro ao obter estatísticas:', err);
      return { total: 0, totalDuration: 0 };
    }
  }, [isInitialized]);

  // Limpar todas as gravações
  const clearAllRecordings = useCallback(async () => {
    if (!isInitialized) return false;
    
    try {
      setError(null);
      await PersistenceService.clearAllRecordings();
      setRecordings([]);
      console.log('Todas as gravações foram deletadas');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao limpar gravações: ${errorMessage}`);
      console.error('Erro ao limpar gravações:', err);
      return false;
    }
  }, [isInitialized]);

  // Inicializar automaticamente quando o hook é montado
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  // Carregar gravações quando o banco for inicializado
  useEffect(() => {
    if (isInitialized) {
      loadRecordings();
    }
  }, [isInitialized, loadRecordings]);

  return {
    // Estado
    isInitialized,
    recordings,
    isLoading,
    error,
    
    // Ações
    initializeDatabase,
    loadRecordings,
    saveRecording,
    updateRecording,
    deleteRecording,
    searchRecordings,
    getStats,
    clearAllRecordings,
    
    // Utilitários
    clearError: () => setError(null),
  };
};

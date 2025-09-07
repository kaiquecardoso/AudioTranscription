import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDatabase } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { Recording } from '../types';

/**
 * Exemplo de como usar o novo sistema de banco de dados SQLite
 * Este arquivo demonstra todas as funcionalidades disponíveis
 */
export const DatabaseUsageExample: React.FC = () => {
  const { theme } = useTheme();
  const {
    recordings,
    isLoading,
    error,
    saveRecording,
    updateRecording,
    deleteRecording,
    searchRecordings,
    getStats,
    clearAllRecordings,
    clearError
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');

  // Exemplo: Criar uma nova gravação
  const handleCreateRecording = async () => {
    const newRecording: Recording = {
      id: `recording_${Date.now()}`,
      uri: 'file:///path/to/audio.mp3',
      duration: 120, // 2 minutos
      transcription: 'Esta é uma transcrição de exemplo',
      summary: 'Resumo da gravação de exemplo',
      timestamp: new Date().toISOString(),
      name: 'Gravação de Exemplo'
    };

    const success = await saveRecording(newRecording);
    if (success) {
      Alert.alert('Sucesso', 'Gravação criada com sucesso!');
    }
  };

  // Exemplo: Atualizar uma gravação existente
  const handleUpdateRecording = async (id: string) => {
    const updates = {
      transcription: 'Transcrição atualizada',
      summary: 'Resumo atualizado'
    };

    const success = await updateRecording(id, updates);
    if (success) {
      Alert.alert('Sucesso', 'Gravação atualizada com sucesso!');
    }
  };

  // Exemplo: Deletar uma gravação
  const handleDeleteRecording = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar esta gravação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRecording(id);
            if (success) {
              Alert.alert('Sucesso', 'Gravação deletada com sucesso!');
            }
          }
        }
      ]
    );
  };

  // Exemplo: Buscar gravações
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const results = await searchRecordings(searchTerm);
    Alert.alert(
      'Resultados da Busca',
      `Encontradas ${results.length} gravações para "${searchTerm}"`
    );
  };

  // Exemplo: Obter estatísticas
  const handleGetStats = async () => {
    const stats = await getStats();
    Alert.alert(
      'Estatísticas',
      `Total de gravações: ${stats.total}\nDuração total: ${Math.floor(stats.totalDuration / 60)} minutos`
    );
  };

  // Exemplo: Limpar todas as gravações
  const handleClearAll = () => {
    Alert.alert(
      'Confirmar Limpeza',
      'Tem certeza que deseja deletar TODAS as gravações? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar Tudo',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllRecordings();
            if (success) {
              Alert.alert('Sucesso', 'Todas as gravações foram deletadas!');
            }
          }
        }
      ]
    );
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erro: {error}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={clearError}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            Limpar Erro
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.onSurface }]}>
        Exemplo de Uso do Banco de Dados
      </Text>

      {/* Estatísticas */}
      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.statsText, { color: theme.onSurface }]}>
          Total de gravações: {recordings.length}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={handleGetStats}
        >
          <Text style={[styles.buttonText, { color: theme.onSecondary }]}>
            Ver Estatísticas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ações CRUD */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleCreateRecording}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            {isLoading ? 'Carregando...' : 'Criar Gravação'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.error }]}
          onPress={handleClearAll}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.onError }]}>
            Limpar Tudo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Text style={[styles.label, { color: theme.onSurface }]}>
          Buscar gravações:
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tertiary }]}
          onPress={handleSearch}
          disabled={!searchTerm.trim() || isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.onTertiary }]}>
            Buscar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de gravações */}
      <View style={styles.listContainer}>
        <Text style={[styles.listTitle, { color: theme.onSurface }]}>
          Gravações ({recordings.length})
        </Text>
        {recordings.map((recording) => (
          <View
            key={recording.id}
            style={[styles.recordingItem, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.recordingName, { color: theme.onSurface }]}>
              {recording.name}
            </Text>
            <Text style={[styles.recordingDuration, { color: theme.onSurfaceVariant }]}>
              {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
            </Text>
            <View style={styles.recordingActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                onPress={() => handleUpdateRecording(recording.id)}
              >
                <Text style={[styles.actionButtonText, { color: theme.onSecondary }]}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error }]}
                onPress={() => handleDeleteRecording(recording.id)}
              >
                <Text style={[styles.actionButtonText, { color: theme.onError }]}>
                  Deletar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recordingItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  recordingDuration: {
    fontSize: 14,
    marginBottom: 10,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

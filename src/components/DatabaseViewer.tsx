import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { DatabaseInspector } from '../utils/databaseInspector';
import { RecordingDetailsModal } from './RecordingDetailsModal';
import { Recording } from '../types';

export const DatabaseViewer: React.FC = () => {
  const { theme } = useTheme();
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadDatabaseInfo = async () => {
    setIsLoading(true);
    try {
      const info = await DatabaseInspector.getDatabaseInfo();
      const recordingsList = await DatabaseInspector.listAllRecordings();
      setDatabaseInfo(info);
      setRecordings(recordingsList);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar informações do banco');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const handleExecuteQuery = async () => {
    if (!customQuery.trim()) return;
    
    try {
      const result = await DatabaseInspector.executeQuery(customQuery);
      setQueryResult(result);
      Alert.alert('Sucesso', `Query executada. ${result.length} resultados encontrados.`);
    } catch (error) {
      Alert.alert('Erro', `Falha ao executar query: ${error.message}`);
    }
  };

  const handleCheckIntegrity = async () => {
    try {
      const integrity = await DatabaseInspector.checkIntegrity();
      Alert.alert(
        'Integridade do Banco',
        `Tabela existe: ${integrity.tableExists ? 'Sim' : 'Não'}\n` +
        `Integridade: ${integrity.integrity}\n` +
        `Colunas: ${integrity.tableSchema.length}`
      );
    } catch (error) {
      Alert.alert('Erro', `Falha ao verificar integridade: ${error.message}`);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await DatabaseInspector.exportData();
      if (result.success) {
        Alert.alert(
          'Export Concluído',
          `Arquivo salvo: ${result.fileName}\n` +
          `Localização: ${result.fileUri}\n` +
          `Gravações exportadas: ${result.recordCount}`
        );
      } else {
        Alert.alert('Erro', `Falha no export: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('Erro', `Falha no export: ${error.message}`);
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Confirmar Limpeza',
      'Tem certeza que deseja limpar TODOS os dados do banco? Esta ação não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await DatabaseInspector.clearDatabase();
              if (result.success) {
                Alert.alert('Sucesso', 'Banco de dados limpo com sucesso');
                loadDatabaseInfo();
              } else {
                Alert.alert('Erro', `Falha ao limpar: ${result.error}`);
              }
            } catch (error) {
              Alert.alert('Erro', `Falha ao limpar: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleShowDetails = (recording: any) => {
    // Converter para o tipo Recording completo
    const fullRecording: Recording = {
      id: recording.id,
      uri: recording.uri,
      duration: parseInt(recording.duration.split(':')[0]) * 60 + parseInt(recording.duration.split(':')[1]),
      transcription: recording.transcription || '',
      summary: recording.summary || '',
      timestamp: recording.timestamp,
      name: recording.name,
    };
    
    setSelectedRecording(fullRecording);
    setShowDetailsModal(true);
  };

  if (isLoading && !databaseInfo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.onSurface }]}>
          Carregando informações do banco...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={loadDatabaseInfo}
          tintColor={theme.primary}
        />
      }
    >
      <Text style={[styles.title, { color: theme.onSurface }]}>
        Visualizador do Banco de Dados
      </Text>

      {/* Informações do Banco */}
      {databaseInfo && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
            Informações do Banco
          </Text>
          <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
            Nome: {databaseInfo.databaseName}
          </Text>
          <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
            Plataforma: {databaseInfo.platform}
          </Text>
          <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
            Total de gravações: {databaseInfo.totalRecordings}
          </Text>
          <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
            Duração total: {Math.floor(databaseInfo.stats.totalDuration / 60)} minutos
          </Text>
          {databaseInfo.fileInfo && (
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Tamanho do arquivo: {Math.round(databaseInfo.fileInfo.size / 1024)} KB
            </Text>
          )}
        </View>
      )}

      {/* Ações */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
          Ações
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={loadDatabaseInfo}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            Atualizar Informações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={handleCheckIntegrity}
        >
          <Text style={[styles.buttonText, { color: theme.onSecondary }]}>
            Verificar Integridade
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tertiary }]}
          onPress={handleExportData}
        >
          <Text style={[styles.buttonText, { color: theme.onTertiary }]}>
            Exportar Dados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.error }]}
          onPress={handleClearDatabase}
        >
          <Text style={[styles.buttonText, { color: theme.onError }]}>
            Limpar Banco (CUIDADO!)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Query Personalizada */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
          Query SQL Personalizada
        </Text>
        <TextInput
          style={[styles.queryInput, { 
            backgroundColor: theme.background,
            color: theme.onSurface,
            borderColor: theme.outline
          }]}
          value={customQuery}
          onChangeText={setCustomQuery}
          placeholder="Digite sua query SQL aqui..."
          placeholderTextColor={theme.onSurfaceVariant}
          multiline
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleExecuteQuery}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            Executar Query
          </Text>
        </TouchableOpacity>
        
        {queryResult.length > 0 && (
          <View style={styles.queryResult}>
            <Text style={[styles.resultTitle, { color: theme.onSurface }]}>
              Resultado da Query:
            </Text>
            <Text style={[styles.resultText, { color: theme.onSurfaceVariant }]}>
              {JSON.stringify(queryResult, null, 2)}
            </Text>
          </View>
        )}
      </View>

      {/* Lista de Gravações */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
          Gravações ({recordings.length})
        </Text>
        {recordings.map((recording, index) => (
          <View
            key={recording.id}
            style={[styles.recordingItem, { 
              backgroundColor: theme.background,
              borderColor: theme.outline
            }]}
          >
            <Text style={[styles.recordingName, { color: theme.onSurface }]}>
              {index + 1}. {recording.name}
            </Text>
            <Text style={[styles.recordingDetails, { color: theme.onSurfaceVariant }]}>
              Duração: {recording.duration} | {recording.timestamp}
            </Text>
            <Text style={[styles.recordingDetails, { color: theme.onSurfaceVariant }]}>
              ID: {recording.id}
            </Text>
            
            {/* Status das transcrições */}
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { 
                color: recording.hasTranscription ? theme.primary : theme.onSurfaceVariant 
              }]}>
                📝 Transcrição: {recording.hasTranscription ? 'Sim' : 'Não'}
              </Text>
              <Text style={[styles.statusText, { 
                color: recording.hasSummary ? theme.primary : theme.onSurfaceVariant 
              }]}>
                📋 Resumo: {recording.hasSummary ? 'Sim' : 'Não'}
              </Text>
            </View>

            {/* Conteúdo da transcrição */}
            {recording.hasTranscription && recording.transcription && (
              <View style={[styles.contentContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.contentTitle, { color: theme.onSurface }]}>
                  📝 Transcrição:
                </Text>
                <Text style={[styles.transcriptionText, { color: theme.onSurface }]}>
                  {recording.transcription}
                </Text>
              </View>
            )}

            {/* Conteúdo do resumo */}
            {recording.hasSummary && recording.summary && (
              <View style={[styles.contentContainer, { backgroundColor: theme.surface }]}>
                <Text style={[styles.contentTitle, { color: theme.onSurface }]}>
                  📋 Resumo:
                </Text>
                <Text style={[styles.summaryText, { color: theme.onSurface }]}>
                  {recording.summary}
                </Text>
              </View>
            )}

            {/* Botão para ver detalhes */}
            <TouchableOpacity
              style={[styles.detailsButton, { backgroundColor: theme.primary }]}
              onPress={() => handleShowDetails(recording)}
            >
              <Text style={[styles.detailsButtonText, { color: theme.onPrimary }]}>
                Ver Detalhes Completos
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal de detalhes */}
      <RecordingDetailsModal
        visible={showDetailsModal}
        recording={selectedRecording}
        onClose={() => setShowDetailsModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  queryInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  queryResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  recordingItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordingDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  detailsButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

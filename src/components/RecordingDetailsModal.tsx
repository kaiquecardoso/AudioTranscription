import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Recording } from '../types';

interface RecordingDetailsModalProps {
  visible: boolean;
  recording: Recording | null;
  onClose: () => void;
}

export const RecordingDetailsModal: React.FC<RecordingDetailsModalProps> = ({
  visible,
  recording,
  onClose,
}) => {
  const { theme } = useTheme();

  if (!recording) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.onSurface }]}>
            Detalhes da Gravação
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: theme.onPrimary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Informações básicas */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
              Informações Básicas
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Nome: {recording.name}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Duração: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Data: {new Date(recording.timestamp).toLocaleString('pt-BR')}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              ID: {recording.id}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Arquivo: {recording.uri}
            </Text>
          </View>

          {/* Transcrição */}
          {recording.transcription && (
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
                📝 Transcrição
              </Text>
              <Text style={[styles.transcriptionText, { color: theme.onSurface }]}>
                {recording.transcription}
              </Text>
            </View>
          )}

          {/* Resumo */}
          {recording.summary && (
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
                📋 Resumo
              </Text>
              <Text style={[styles.summaryText, { color: theme.onSurface }]}>
                {recording.summary}
              </Text>
            </View>
          )}

          {/* Estatísticas */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>
              Estatísticas
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Caracteres na transcrição: {recording.transcription?.length || 0}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Caracteres no resumo: {recording.summary?.length || 0}
            </Text>
            <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>
              Palavras na transcrição: {recording.transcription?.split(' ').length || 0}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 6,
    lineHeight: 20,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
});

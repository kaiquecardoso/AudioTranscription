import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingModalStyles } from '../styles';

interface TranscriptionSectionProps {
  transcription: string | null;
  summary: string | null;
  isSummaryExpanded: boolean;
  onToggleSummary: () => void;
}

const TranscriptionSection: React.FC<TranscriptionSectionProps> = ({
  transcription,
  summary,
  isSummaryExpanded,
  onToggleSummary,
}) => {
  const { theme } = useTheme();

  if (!transcription) {
    return null;
  }

  return (
    <View style={[recordingModalStyles.transcriptionContainer, {
      backgroundColor: theme.surface,
      borderColor: theme.glassBorder,
    }]}>
      <TouchableOpacity
        style={recordingModalStyles.transcriptionHeader}
        onPress={onToggleSummary}
        activeOpacity={0.7}
      >
        <Text style={[recordingModalStyles.transcriptionTitle, { color: theme.onSurface }]}>
          Transcrição
        </Text>
        <Ionicons 
          name={isSummaryExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.onSurface} 
        />
      </TouchableOpacity>
      
      <Text style={[recordingModalStyles.transcriptionText, { color: theme.onSurfaceVariant }]}>
        {transcription}
      </Text>
      
      {summary && (
        <View style={recordingModalStyles.summarySection}>
          <Text style={[recordingModalStyles.summaryTitle, { color: theme.onSurface }]}>
            Resumo do Conteúdo
          </Text>
          
          {isSummaryExpanded && (
            <Text style={[recordingModalStyles.summaryText, { color: theme.onSurfaceVariant }]}>
              {summary}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default TranscriptionSection;

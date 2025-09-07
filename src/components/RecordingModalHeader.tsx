import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { recordingModalStyles } from '../styles';

interface RecordingModalHeaderProps {
  onClose: () => void;
}

const RecordingModalHeader: React.FC<RecordingModalHeaderProps> = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={[recordingModalStyles.header, {
        borderBottomWidth: 1,
        borderBottomColor: theme.glassBorder,
        shadowColor: theme.glassShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }]}
    >
      <TouchableOpacity onPress={onClose} style={recordingModalStyles.closeButton}>
        <Ionicons name="close" size={24} color={theme.onSurface} />
      </TouchableOpacity>
      <Text style={[recordingModalStyles.headerTitle, { color: theme.onSurface }]}>
        Gravação de Voz
      </Text>
      <View style={recordingModalStyles.placeholder} />
    </BlurView>
  );
};

export default RecordingModalHeader;

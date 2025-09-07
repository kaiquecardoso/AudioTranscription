import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useRecordings } from '../hooks';
import { settingsScreenStyles } from '../styles';
import { SettingItemProps, ActionItemProps } from '../types';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { clearAllRecordings } = useRecordings();

  const handleClearAllRecordings = () => {
    Alert.alert(
      'Limpar Gravações',
      'Tem certeza que deseja excluir todas as gravações? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllRecordings();
              Alert.alert('Sucesso', 'Todas as gravações foram excluídas.');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir gravações.');
            }
          }
        },
      ]
    );
  };

  const handleExportRecordings = () => {
    Alert.alert(
      'Exportar Gravações',
      'Funcionalidade de exportação será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem: React.FC<SettingItemProps> = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange 
  }) => (
    <View style={[settingsScreenStyles.settingItem, { borderBottomColor: theme.outlineVariant }]}>
      <View style={settingsScreenStyles.settingContent}>
        <Text style={[settingsScreenStyles.settingTitle, { color: theme.onSurface }]}>{title}</Text>
        <Text style={[settingsScreenStyles.settingSubtitle, { color: theme.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.outlineVariant, true: theme.primary }}
        thumbColor={value ? theme.onPrimary : theme.surfaceContainerHighest}
      />
    </View>
  );

  const ActionItem: React.FC<ActionItemProps> = ({ 
    title, 
    subtitle, 
    onPress,
    color = theme.onSurface
  }) => (
    <TouchableOpacity style={[settingsScreenStyles.actionItem, { borderBottomColor: theme.outlineVariant }]} onPress={onPress}>
      <View style={settingsScreenStyles.settingContent}>
        <Text style={[settingsScreenStyles.settingTitle, { color }]}>{title}</Text>
        <Text style={[settingsScreenStyles.settingSubtitle, { color: theme.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.onSurfaceVariant} />
    </TouchableOpacity>
  );

  return (
    <View style={[settingsScreenStyles.container, { backgroundColor: theme.background }]}>
      {/* Header Personalizado */}
      <BlurView 
        intensity={80} 
        tint="dark"
        style={[settingsScreenStyles.header, { 
          borderBottomWidth: 1,
          borderBottomColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }]}
      >
        <Text style={[settingsScreenStyles.headerTitle, { color: theme.onSurface }]}>Configurações</Text>
      </BlurView>

      <ScrollView style={settingsScreenStyles.scrollView}>

      {/* Configurações de Gravação */}
      <BlurView 
        intensity={50} 
        tint="dark"
        style={[settingsScreenStyles.section, { 
          borderWidth: 1,
          borderColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }]}
      >
        <SettingItem
          title="Alta Qualidade"
          subtitle="Gravar em qualidade máxima (mais espaço)"
          value={settings.highQuality}
          onValueChange={(value) => updateSetting('highQuality', value)}
        />
        
        <SettingItem
          title="Salvar na Galeria"
          subtitle="Salvar gravações na galeria do dispositivo"
          value={settings.saveToGallery}
          onValueChange={(value) => updateSetting('saveToGallery', value)}
        />
      </BlurView>

      {/* Configurações de Interface */}
      <BlurView 
        intensity={50} 
        tint="dark"
        style={[settingsScreenStyles.section, { 
          borderWidth: 1,
          borderColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }]}
      >
        
        <SettingItem
          title="Notificações"
          subtitle="Receber notificações sobre gravações"
          value={settings.notifications}
          onValueChange={(value) => updateSetting('notifications', value)}
        />
      </BlurView>

      {/* Ações */}
      <BlurView 
        intensity={50} 
        tint="dark"
        style={[settingsScreenStyles.section, { 
          borderWidth: 1,
          borderColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }]}
      >
        <ActionItem
          title="Exportar Gravações"
          subtitle="Baixar todas as gravações"
          onPress={handleExportRecordings}
        />
        
        <ActionItem
          title="Limpar Todas as Gravações"
          subtitle="Excluir permanentemente todas as gravações"
          onPress={handleClearAllRecordings}
          color={theme.error}
        />
      </BlurView>

      </ScrollView>
    </View>
  );
}

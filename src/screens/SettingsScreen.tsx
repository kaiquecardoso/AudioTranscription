import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

interface Settings {
  autoTranscription: boolean;
  highQuality: boolean;
  saveToGallery: boolean;
  notifications: boolean;
}

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateSetting } = useSettings();

  const clearAllRecordings = () => {
    Alert.alert(
      'Limpar Gravações',
      'Tem certeza que deseja excluir todas as gravações? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            // Implementar lógica de limpeza
            Alert.alert('Sucesso', 'Todas as gravações foram excluídas.');
          }
        },
      ]
    );
  };

  const exportRecordings = () => {
    Alert.alert(
      'Exportar Gravações',
      'Funcionalidade de exportação será implementada em breve.',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange 
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.outlineVariant }]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.onSurface }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.outlineVariant, true: theme.primary }}
        thumbColor={value ? theme.onPrimary : theme.surfaceContainerHighest}
      />
    </View>
  );

  const ActionItem = ({ 
    title, 
    subtitle, 
    onPress,
    color = theme.onSurface
  }: {
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={[styles.actionItem, { borderBottomColor: theme.outlineVariant }]} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.onSurfaceVariant} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Personalizado */}
      <BlurView 
        intensity={80} 
        tint="dark"
        style={[styles.header, { 
          borderBottomWidth: 1,
          borderBottomColor: theme.glassBorder,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }]}
      >
        <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Configurações</Text>
      </BlurView>

      <ScrollView style={styles.scrollView}>

      {/* Configurações de Gravação */}
      <BlurView 
        intensity={50} 
        tint="dark"
        style={[styles.section, { 
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
          title="Transcrição Automática"
          subtitle="Transcrever áudio automaticamente após gravação"
          value={settings.autoTranscription}
          onValueChange={(value) => updateSetting('autoTranscription', value)}
        />
        
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
        style={[styles.section, { 
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
        style={[styles.section, { 
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
          onPress={exportRecordings}
        />
        
        <ActionItem
          title="Limpar Todas as Gravações"
          subtitle="Excluir permanentemente todas as gravações"
          onPress={clearAllRecordings}
          color={theme.error}
        />
      </BlurView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 80, // Espaço para a tab bar absoluta
  },
  scrollView: {
    flex: 1,
    paddingTop: 100, // Espaço para o header
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
});

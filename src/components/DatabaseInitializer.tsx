import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useDatabase } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}

export const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ children }) => {
  const { isInitialized, isLoading, error } = useDatabase();
  const { theme } = useTheme();

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erro ao inicializar banco de dados
        </Text>
        <Text style={[styles.errorDetail, { color: theme.onSurfaceVariant }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.onSurface }]}>
          Inicializando banco de dados...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RecordingScreen from './src/screens/RecordingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { DatabaseInitializer, DatabaseViewer } from './src/components';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <NavigationContainer>
        <StatusBar barStyle={theme.statusBar} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Gravação') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'Configurações') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else if (route.name === 'Banco de Dados') {
                iconName = focused ? 'server' : 'server-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.onSurfaceVariant,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              borderTopColor: theme.glassBorder,
              borderTopWidth: 1,
              shadowColor: theme.glassShadow,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            },
            tabBarBackground: () => (
              <BlurView 
                intensity={80} 
                tint="dark"
                style={{ 
                  flex: 1,
                }} 
              />
            ),
          })}
        >
          <Tab.Screen 
            name="Gravação" 
            component={RecordingScreen}
            options={{
              title: 'Gravação de Voz',
            }}
          />
          <Tab.Screen 
            name="Configurações" 
            component={SettingsScreen}
            options={{
              title: 'Configurações',
            }}
          />
          <Tab.Screen 
            name="Banco de Dados" 
            component={DatabaseViewer}
            options={{
              title: 'Banco de Dados',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SettingsProvider>
          <DatabaseInitializer>
            <AppContent />
          </DatabaseInitializer>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

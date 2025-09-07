import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
  autoTranscription: boolean;
  highQuality: boolean;
  saveToGallery: boolean;
  notifications: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    autoTranscription: true,
    highQuality: true,
    saveToGallery: false,
    notifications: true,
  });

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

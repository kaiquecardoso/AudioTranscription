export interface Settings {
  highQuality: boolean;
  saveToGallery: boolean;
  notifications: boolean;
}

export interface SettingItemProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export interface ActionItemProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}

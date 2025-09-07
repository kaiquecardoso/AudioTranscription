import { useState } from 'react';
import { Alert } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

export const useAudioPlayback = () => {
  const player = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const playRecording = async (uri: string, id?: string) => {
    try {
      player.replace(uri);
      player.play();
      
      setIsPlaying(true);
      setCurrentPlayingId(id || uri);
    } catch (error) {
      console.error('Erro ao reproduzir:', error);
      Alert.alert('Erro', 'Falha ao reproduzir gravação');
    }
  };

  const stopPlayback = async () => {
    player.pause();
    setIsPlaying(false);
    setCurrentPlayingId(null);
  };

  const pausePlayback = async () => {
    player.pause();
    setIsPlaying(false);
  };

  const resumePlayback = async () => {
    player.play();
    setIsPlaying(true);
  };

  return {
    isPlaying,
    currentPlayingId,
    playRecording,
    stopPlayback,
    pausePlayback,
    resumePlayback,
  };
};

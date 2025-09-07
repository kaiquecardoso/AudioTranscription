import { useState } from 'react';
import { Alert } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

export const useAudioPlayback = () => {
  const player = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const playRecording = async (uri: string, id?: string) => {
    try {
      // CORREÇÃO: Mudar para modo de reprodução antes de iniciar o player
      // Isso evita que o iOS mantenha a rota no auricular (alto-falante superior)
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false, // IMPORTANTE: false para modo de reprodução
      });
      
      player.replace(uri);
      player.play();
      
      setIsPlaying(true);
      setCurrentPlayingId(id || uri);
      console.log('Reprodução iniciada com sucesso - modo de áudio corrigido');
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
    try {
      // Garantir que está em modo de reprodução ao retomar
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
      
      player.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Erro ao retomar reprodução:', error);
    }
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

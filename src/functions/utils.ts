export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} às ${timeStr}`;
};

export const generateFileName = (): string => {
  return `recording_${Date.now()}.m4a`;
};

export const createRecordingData = (
  uri: string,
  duration: number,
  transcription: string = '',
  summary: string = ''
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return {
    id: Date.now().toString(),
    uri,
    duration,
    transcription,
    summary,
    timestamp: now.toISOString(),
    name: `Gravação ${dateStr} ${timeStr}`,
  };
};

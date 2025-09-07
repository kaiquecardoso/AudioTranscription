export interface Recording {
  id: string;
  uri: string;
  duration: number;
  transcription: string;
  summary: string;
  timestamp: string;
  name: string;
}

export interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: (recording: Recording) => void;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
  isPlaying: boolean;
  currentPlayingId: string | null;
  transcription: string;
  summary: string;
  isTranscribing: boolean;
  isSummaryExpanded: boolean;
  isSaving: boolean;
}

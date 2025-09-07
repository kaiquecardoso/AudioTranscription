import { DatabaseService } from './databaseService';
import { Recording } from '../types';

export class PersistenceService {
  // Inicializar o banco de dados
  static async initialize(): Promise<void> {
    await DatabaseService.initialize();
  }

  // CREATE - Salvar gravação completa
  static async saveRecording(recording: Recording): Promise<void> {
    try {
      await DatabaseService.createRecording(recording);
      console.log('Gravação salva com sucesso:', recording.id);
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      throw error;
    }
  }

  // READ - Carregar gravação por ID
  static async loadRecording(recordingId: string): Promise<Recording | null> {
    try {
      return await DatabaseService.getRecordingById(recordingId);
    } catch (error) {
      console.error('Erro ao carregar gravação:', error);
      return null;
    }
  }

  // READ - Carregar todas as gravações
  static async loadAllRecordings(): Promise<Recording[]> {
    try {
      return await DatabaseService.getAllRecordings();
    } catch (error) {
      console.error('Erro ao carregar todas as gravações:', error);
      return [];
    }
  }

  // UPDATE - Atualizar gravação
  static async updateRecording(id: string, updates: Partial<Recording>): Promise<void> {
    try {
      await DatabaseService.updateRecording(id, updates);
      console.log('Gravação atualizada:', id);
    } catch (error) {
      console.error('Erro ao atualizar gravação:', error);
      throw error;
    }
  }

  // DELETE - Deletar gravação
  static async deleteRecording(recordingId: string): Promise<void> {
    try {
      await DatabaseService.deleteRecording(recordingId);
      console.log('Gravação deletada:', recordingId);
    } catch (error) {
      console.error('Erro ao deletar gravação:', error);
      throw error;
    }
  }

  // DELETE - Deletar todas as gravações
  static async clearAllRecordings(): Promise<void> {
    try {
      await DatabaseService.deleteAllRecordings();
      console.log('Todas as gravações foram deletadas');
    } catch (error) {
      console.error('Erro ao limpar todas as gravações:', error);
      throw error;
    }
  }

  // SEARCH - Buscar gravações
  static async searchRecordings(searchTerm: string): Promise<Recording[]> {
    try {
      return await DatabaseService.searchRecordings(searchTerm);
    } catch (error) {
      console.error('Erro ao buscar gravações:', error);
      return [];
    }
  }

  // STATS - Obter estatísticas
  static async getStats(): Promise<{ total: number; totalDuration: number }> {
    try {
      return await DatabaseService.getStats();
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { total: 0, totalDuration: 0 };
    }
  }

  // Métodos de compatibilidade com a versão anterior (deprecated)
  /** @deprecated Use saveRecording em vez de saveRecordingMetadata */
  static async saveRecordingMetadata(recording: Recording): Promise<void> {
    console.warn('saveRecordingMetadata está deprecated. Use saveRecording.');
    return this.saveRecording(recording);
  }

  /** @deprecated Use loadRecording em vez de loadRecordingMetadata */
  static async loadRecordingMetadata(recordingId: string): Promise<Partial<Recording> | null> {
    console.warn('loadRecordingMetadata está deprecated. Use loadRecording.');
    const recording = await this.loadRecording(recordingId);
    return recording ? {
      transcription: recording.transcription,
      summary: recording.summary,
      duration: recording.duration,
      name: recording.name,
    } : null;
  }

  /** @deprecated Use loadAllRecordings em vez de loadAllMetadata */
  static async loadAllMetadata(): Promise<Record<string, Partial<Recording>>> {
    console.warn('loadAllMetadata está deprecated. Use loadAllRecordings.');
    const recordings = await this.loadAllRecordings();
    const metadata: Record<string, Partial<Recording>> = {};
    
    recordings.forEach(recording => {
      metadata[recording.id] = {
        transcription: recording.transcription,
        summary: recording.summary,
        duration: recording.duration,
        name: recording.name,
      };
    });
    
    return metadata;
  }

  /** @deprecated Use deleteRecording em vez de deleteRecordingMetadata */
  static async deleteRecordingMetadata(recordingId: string): Promise<void> {
    console.warn('deleteRecordingMetadata está deprecated. Use deleteRecording.');
    return this.deleteRecording(recordingId);
  }

  /** @deprecated Use clearAllRecordings em vez de clearAllMetadata */
  static async clearAllMetadata(): Promise<void> {
    console.warn('clearAllMetadata está deprecated. Use clearAllRecordings.');
    return this.clearAllRecordings();
  }
}

import * as FileSystem from 'expo-file-system';
import { Recording } from '../types';

export class PersistenceService {
  private static readonly METADATA_FILE = 'recordings_metadata.json';

  private static getMetadataPath(): string {
    return `${FileSystem.documentDirectory}${this.METADATA_FILE}`;
  }

  static async saveRecordingMetadata(recording: Recording): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath();
      let metadata: Record<string, Partial<Recording>> = {};

      // Carregar metadados existentes
      try {
        const existingData = await FileSystem.readAsStringAsync(metadataPath);
        metadata = JSON.parse(existingData);
      } catch (error) {
        // Arquivo não existe ou está corrompido, começar do zero
        console.log('Criando novo arquivo de metadados');
      }

      // Salvar metadados da gravação
      metadata[recording.id] = {
        transcription: recording.transcription,
        summary: recording.summary,
        duration: recording.duration,
        name: recording.name,
      };

      // Salvar de volta no arquivo
      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Erro ao salvar metadados da gravação:', error);
      throw error;
    }
  }

  static async loadRecordingMetadata(recordingId: string): Promise<Partial<Recording> | null> {
    try {
      const metadataPath = this.getMetadataPath();
      const data = await FileSystem.readAsStringAsync(metadataPath);
      const metadata: Record<string, Partial<Recording>> = JSON.parse(data);
      
      return metadata[recordingId] || null;
    } catch (error) {
      console.error('Erro ao carregar metadados da gravação:', error);
      return null;
    }
  }

  static async loadAllMetadata(): Promise<Record<string, Partial<Recording>>> {
    try {
      const metadataPath = this.getMetadataPath();
      const data = await FileSystem.readAsStringAsync(metadataPath);
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar todos os metadados:', error);
      return {};
    }
  }

  static async deleteRecordingMetadata(recordingId: string): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath();
      let metadata: Record<string, Partial<Recording>> = {};

      try {
        const data = await FileSystem.readAsStringAsync(metadataPath);
        metadata = JSON.parse(data);
      } catch (error) {
        // Arquivo não existe, não há nada para deletar
        return;
      }

      delete metadata[recordingId];

      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Erro ao deletar metadados da gravação:', error);
      throw error;
    }
  }

  static async clearAllMetadata(): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath();
      await FileSystem.deleteAsync(metadataPath);
    } catch (error) {
      console.error('Erro ao limpar todos os metadados:', error);
      throw error;
    }
  }
}

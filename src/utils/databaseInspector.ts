import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { DatabaseService } from '../services';

export class DatabaseInspector {
  // Obter informações do banco de dados
  static async getDatabaseInfo() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Informações básicas
      const stats = await DatabaseService.getStats();
      const recordings = await DatabaseService.getAllRecordings();
      
      // Informações do arquivo (se possível)
      let fileInfo = null;
      try {
        // Tentar obter informações do arquivo
        const dbPath = `${FileSystem.documentDirectory}SQLite/recordings.db`;
        const fileExists = await FileSystem.getInfoAsync(dbPath);
        if (fileExists.exists) {
          fileInfo = {
            exists: true,
            uri: fileInfo.uri,
            size: fileInfo.size,
            modificationTime: fileInfo.modificationTime,
          };
        }
      } catch (error) {
        console.log('Não foi possível obter informações do arquivo:', error);
      }

      return {
        stats,
        totalRecordings: recordings.length,
        recordings: recordings.slice(0, 5), // Primeiras 5 gravações
        fileInfo,
        databaseName: 'recordings.db',
        platform: Platform.OS,
      };
    } catch (error) {
      console.error('Erro ao obter informações do banco:', error);
      return null;
    }
  }

  // Listar todas as gravações com detalhes
  static async listAllRecordings() {
    try {
      const recordings = await DatabaseService.getAllRecordings();
      
      return recordings.map(recording => ({
        id: recording.id,
        name: recording.name,
        duration: `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}`,
        timestamp: new Date(recording.timestamp).toLocaleString('pt-BR'),
        hasTranscription: !!recording.transcription,
        hasSummary: !!recording.summary,
        transcription: recording.transcription || '',
        summary: recording.summary || '',
        uri: recording.uri,
      }));
    } catch (error) {
      console.error('Erro ao listar gravações:', error);
      return [];
    }
  }

  // Executar query SQL personalizada (para debug)
  static async executeQuery(query: string) {
    try {
      const db = await DatabaseService.getDatabase();
      const result = await db.getAllAsync(query);
      return result;
    } catch (error) {
      console.error('Erro ao executar query:', error);
      throw error;
    }
  }

  // Verificar integridade do banco
  static async checkIntegrity() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Verificar se a tabela existe
      const tableExists = await db.getAllAsync(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='recordings'
      `);
      
      // Verificar estrutura da tabela
      const tableSchema = await db.getAllAsync(`
        PRAGMA table_info(recordings)
      `);
      
      // Verificar índices
      const indexes = await db.getAllAsync(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND tbl_name='recordings'
      `);
      
      return {
        tableExists: tableExists.length > 0,
        tableSchema,
        indexes,
        integrity: 'OK'
      };
    } catch (error) {
      console.error('Erro ao verificar integridade:', error);
      return {
        tableExists: false,
        tableSchema: [],
        indexes: [],
        integrity: 'ERROR',
        error: error.message
      };
    }
  }

  // Exportar dados do banco (para backup)
  static async exportData() {
    try {
      const recordings = await DatabaseService.getAllRecordings();
      const stats = await DatabaseService.getStats();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        stats,
        recordings,
        version: '1.0.0'
      };
      
      // Salvar arquivo de export
      const fileName = `recordings_backup_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        fileUri, 
        JSON.stringify(exportData, null, 2)
      );
      
      return {
        success: true,
        fileName,
        fileUri,
        recordCount: recordings.length
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Limpar banco de dados (CUIDADO!)
  static async clearDatabase() {
    try {
      await DatabaseService.deleteAllRecordings();
      return {
        success: true,
        message: 'Banco de dados limpo com sucesso'
      };
    } catch (error) {
      console.error('Erro ao limpar banco:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

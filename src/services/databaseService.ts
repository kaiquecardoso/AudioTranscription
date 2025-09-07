import * as SQLite from 'expo-sqlite';
import { Recording } from '../types';

export class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;
  private static readonly DB_NAME = 'recordings.db';

  static async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
      await this.createTables();
      console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Banco de dados não inicializado');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS recordings (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        duration INTEGER NOT NULL,
        transcription TEXT,
        summary TEXT,
        timestamp TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await this.db.execAsync(createTableQuery);
    console.log('Tabela de gravações criada/verificada com sucesso');
  }

  static async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  // CREATE - Criar nova gravação
  static async createRecording(recording: Recording): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      const insertQuery = `
        INSERT INTO recordings (id, uri, duration, transcription, summary, timestamp, name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.runAsync(
        insertQuery,
        [
          recording.id,
          recording.uri,
          recording.duration,
          recording.transcription || '',
          recording.summary || '',
          recording.timestamp,
          recording.name
        ]
      );

      console.log('Gravação salva no banco de dados:', recording.id);
    } catch (error) {
      console.error('Erro ao criar gravação:', error);
      throw error;
    }
  }

  // READ - Listar todas as gravações
  static async getAllRecordings(): Promise<Recording[]> {
    try {
      const db = await this.getDatabase();
      
      const selectQuery = `
        SELECT id, uri, duration, transcription, summary, timestamp, name
        FROM recordings
        ORDER BY created_at DESC
      `;

      const result = await db.getAllAsync(selectQuery);
      
      return result.map((row: any) => ({
        id: row.id as string,
        uri: row.uri as string,
        duration: row.duration as number,
        transcription: (row.transcription as string) || '',
        summary: (row.summary as string) || '',
        timestamp: row.timestamp as string,
        name: row.name as string
      }));
    } catch (error) {
      console.error('Erro ao listar gravações:', error);
      throw error;
    }
  }

  // READ - Buscar gravação por ID
  static async getRecordingById(id: string): Promise<Recording | null> {
    try {
      const db = await this.getDatabase();
      
      const selectQuery = `
        SELECT id, uri, duration, transcription, summary, timestamp, name
        FROM recordings
        WHERE id = ?
      `;

      const result = await db.getFirstAsync(selectQuery, [id]) as any;
      
      if (!result) {
        return null;
      }

      return {
        id: result.id,
        uri: result.uri,
        duration: result.duration,
        transcription: result.transcription || '',
        summary: result.summary || '',
        timestamp: result.timestamp,
        name: result.name
      };
    } catch (error) {
      console.error('Erro ao buscar gravação por ID:', error);
      throw error;
    }
  }

  // UPDATE - Atualizar gravação
  static async updateRecording(id: string, updates: Partial<Recording>): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      const fields = [];
      const values = [];

      if (updates.transcription !== undefined) {
        fields.push('transcription = ?');
        values.push(updates.transcription);
      }
      if (updates.summary !== undefined) {
        fields.push('summary = ?');
        values.push(updates.summary);
      }
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.duration !== undefined) {
        fields.push('duration = ?');
        values.push(updates.duration);
      }

      if (fields.length === 0) {
        console.log('Nenhum campo para atualizar');
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const updateQuery = `
        UPDATE recordings
        SET ${fields.join(', ')}
        WHERE id = ?
      `;

      await db.runAsync(updateQuery, values);
      console.log('Gravação atualizada:', id);
    } catch (error) {
      console.error('Erro ao atualizar gravação:', error);
      throw error;
    }
  }

  // DELETE - Deletar gravação
  static async deleteRecording(id: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      const deleteQuery = 'DELETE FROM recordings WHERE id = ?';
      await db.runAsync(deleteQuery, [id]);
      
      console.log('Gravação deletada:', id);
    } catch (error) {
      console.error('Erro ao deletar gravação:', error);
      throw error;
    }
  }

  // DELETE - Deletar todas as gravações
  static async deleteAllRecordings(): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      const deleteQuery = 'DELETE FROM recordings';
      await db.runAsync(deleteQuery);
      
      console.log('Todas as gravações foram deletadas');
    } catch (error) {
      console.error('Erro ao deletar todas as gravações:', error);
      throw error;
    }
  }

  // Buscar gravações por texto (transcrição ou nome)
  static async searchRecordings(searchTerm: string): Promise<Recording[]> {
    try {
      const db = await this.getDatabase();
      
      const searchQuery = `
        SELECT id, uri, duration, transcription, summary, timestamp, name
        FROM recordings
        WHERE transcription LIKE ? OR name LIKE ? OR summary LIKE ?
        ORDER BY created_at DESC
      `;

      const searchPattern = `%${searchTerm}%`;
      const result = await db.getAllAsync(searchQuery, [searchPattern, searchPattern, searchPattern]);
      
      return result.map((row: any) => ({
        id: row.id as string,
        uri: row.uri as string,
        duration: row.duration as number,
        transcription: (row.transcription as string) || '',
        summary: (row.summary as string) || '',
        timestamp: row.timestamp as string,
        name: row.name as string
      }));
    } catch (error) {
      console.error('Erro ao buscar gravações:', error);
      throw error;
    }
  }

  // Estatísticas do banco
  static async getStats(): Promise<{ total: number; totalDuration: number }> {
    try {
      const db = await this.getDatabase();
      
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(duration) as totalDuration
        FROM recordings
      `;

      const result = await db.getFirstAsync(statsQuery) as any;
      
      return {
        total: result?.total || 0,
        totalDuration: result?.totalDuration || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Fechar conexão com o banco
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('Conexão com banco de dados fechada');
    }
  }
}

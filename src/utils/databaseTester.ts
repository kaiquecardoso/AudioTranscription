import { DatabaseService } from '../services';
import { Recording } from '../types';

export class DatabaseTester {
  // Teste básico de conectividade
  static async testConnection() {
    try {
      const db = await DatabaseService.getDatabase();
      console.log('✅ Conexão com banco estabelecida');
      return { success: true, message: 'Conexão OK' };
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      return { success: false, message: error.message };
    }
  }

  // Teste de criação de gravação
  static async testCreateRecording() {
    try {
      const testRecording: Recording = {
        id: `test_${Date.now()}`,
        uri: 'file:///test/audio.mp3',
        duration: 60,
        transcription: 'Este é um teste de gravação',
        summary: 'Resumo do teste',
        timestamp: new Date().toISOString(),
        name: 'Teste de Gravação'
      };

      await DatabaseService.createRecording(testRecording);
      console.log('✅ Gravação de teste criada:', testRecording.id);
      return { success: true, recording: testRecording };
    } catch (error) {
      console.error('❌ Erro ao criar gravação:', error);
      return { success: false, error: error.message };
    }
  }

  // Teste de listagem
  static async testListRecordings() {
    try {
      const recordings = await DatabaseService.getAllRecordings();
      console.log(`✅ ${recordings.length} gravações encontradas`);
      return { success: true, count: recordings.length, recordings };
    } catch (error) {
      console.error('❌ Erro ao listar gravações:', error);
      return { success: false, error: error.message };
    }
  }

  // Teste de busca
  static async testSearch() {
    try {
      const results = await DatabaseService.searchRecordings('teste');
      console.log(`✅ Busca retornou ${results.length} resultados`);
      return { success: true, count: results.length, results };
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return { success: false, error: error.message };
    }
  }

  // Teste de estatísticas
  static async testStats() {
    try {
      const stats = await DatabaseService.getStats();
      console.log('✅ Estatísticas obtidas:', stats);
      return { success: true, stats };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // Teste completo
  static async runAllTests() {
    console.log('🧪 Iniciando testes do banco de dados...');
    
    const results = {
      connection: await this.testConnection(),
      create: await this.testCreateRecording(),
      list: await this.testListRecordings(),
      search: await this.testSearch(),
      stats: await this.testStats()
    };

    const allPassed = Object.values(results).every(result => result.success);
    
    console.log('🧪 Resultados dos testes:');
    console.log('Conexão:', results.connection.success ? '✅' : '❌');
    console.log('Criação:', results.create.success ? '✅' : '❌');
    console.log('Listagem:', results.list.success ? '✅' : '❌');
    console.log('Busca:', results.search.success ? '✅' : '❌');
    console.log('Estatísticas:', results.stats.success ? '✅' : '❌');
    
    return {
      allPassed,
      results,
      summary: allPassed ? 'Todos os testes passaram!' : 'Alguns testes falharam'
    };
  }

  // Limpar dados de teste
  static async cleanupTestData() {
    try {
      const recordings = await DatabaseService.getAllRecordings();
      const testRecordings = recordings.filter(r => r.id.startsWith('test_'));
      
      for (const recording of testRecordings) {
        await DatabaseService.deleteRecording(recording.id);
      }
      
      console.log(`✅ ${testRecordings.length} gravações de teste removidas`);
      return { success: true, removed: testRecordings.length };
    } catch (error) {
      console.error('❌ Erro ao limpar dados de teste:', error);
      return { success: false, error: error.message };
    }
  }
}

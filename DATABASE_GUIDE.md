# Guia do Sistema de Banco de Dados SQLite

## Visão Geral

Este projeto agora utiliza **SQLite** como banco de dados offline para armazenar gravações de áudio e seus metadados. O SQLite foi escolhido por ser:

- ✅ **Nativo e Offline**: Funciona sem conexão com a internet
- ✅ **Performance**: Consultas rápidas e operações CRUD eficientes
- ✅ **Confiável**: Usado por milhões de aplicações
- ✅ **Pequeno**: Adiciona apenas ~1MB ao bundle
- ✅ **Compatível**: Funciona perfeitamente com React Native/Expo

## Estrutura do Banco

### Tabela `recordings`
```sql
CREATE TABLE recordings (
  id TEXT PRIMARY KEY,           -- ID único da gravação
  uri TEXT NOT NULL,             -- Caminho do arquivo de áudio
  duration INTEGER NOT NULL,     -- Duração em segundos
  transcription TEXT,            -- Texto transcrito
  summary TEXT,                  -- Resumo da gravação
  timestamp TEXT NOT NULL,       -- Data/hora da gravação
  name TEXT NOT NULL,            -- Nome da gravação
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Como Usar

### 1. Inicialização Automática

O banco é inicializado automaticamente quando o app inicia através do `DatabaseInitializer`:

```tsx
// App.tsx
<DatabaseInitializer>
  <AppContent />
</DatabaseInitializer>
```

### 2. Hook useDatabase

Use o hook `useDatabase` para acessar todas as funcionalidades:

```tsx
import { useDatabase } from './src/hooks';

const MyComponent = () => {
  const {
    recordings,        // Lista de todas as gravações
    isLoading,         // Estado de carregamento
    error,            // Erro atual
    saveRecording,    // Criar nova gravação
    updateRecording,  // Atualizar gravação
    deleteRecording,  // Deletar gravação
    searchRecordings, // Buscar gravações
    getStats,         // Obter estatísticas
    clearAllRecordings // Limpar todas as gravações
  } = useDatabase();

  // Seus componentes aqui...
};
```

### 3. Operações CRUD

#### CREATE - Criar Gravação
```tsx
const newRecording: Recording = {
  id: `recording_${Date.now()}`,
  uri: 'file:///path/to/audio.mp3',
  duration: 120,
  transcription: 'Texto transcrito',
  summary: 'Resumo da gravação',
  timestamp: new Date().toISOString(),
  name: 'Minha Gravação'
};

const success = await saveRecording(newRecording);
```

#### READ - Listar Gravações
```tsx
// As gravações são carregadas automaticamente
console.log(recordings); // Array de Recording[]

// Ou carregar manualmente
await loadRecordings();
```

#### UPDATE - Atualizar Gravação
```tsx
const updates = {
  transcription: 'Nova transcrição',
  summary: 'Novo resumo',
  name: 'Novo nome'
};

const success = await updateRecording(recordingId, updates);
```

#### DELETE - Deletar Gravação
```tsx
const success = await deleteRecording(recordingId);
```

### 4. Funcionalidades Avançadas

#### Buscar Gravações
```tsx
const results = await searchRecordings('termo de busca');
// Busca em: nome, transcrição e resumo
```

#### Estatísticas
```tsx
const stats = await getStats();
console.log(`Total: ${stats.total} gravações`);
console.log(`Duração total: ${stats.totalDuration} segundos`);
```

#### Limpar Tudo
```tsx
const success = await clearAllRecordings();
```

## Serviços Disponíveis

### DatabaseService
Serviço de baixo nível que gerencia diretamente o SQLite:

```tsx
import { DatabaseService } from './src/services';

// Inicializar
await DatabaseService.initialize();

// Operações CRUD
await DatabaseService.createRecording(recording);
await DatabaseService.getAllRecordings();
await DatabaseService.getRecordingById(id);
await DatabaseService.updateRecording(id, updates);
await DatabaseService.deleteRecording(id);
```

### PersistenceService
Serviço de alto nível com métodos de compatibilidade:

```tsx
import { PersistenceService } from './src/services';

// Novos métodos (recomendados)
await PersistenceService.saveRecording(recording);
await PersistenceService.loadAllRecordings();
await PersistenceService.updateRecording(id, updates);
await PersistenceService.deleteRecording(id);

// Métodos antigos (deprecated, mas funcionam)
await PersistenceService.saveRecordingMetadata(recording);
await PersistenceService.loadAllMetadata();
```

## Migração do Sistema Anterior

O sistema anterior usava arquivos JSON para armazenar metadados. O novo sistema:

1. **Mantém compatibilidade**: Métodos antigos ainda funcionam
2. **Melhora performance**: Consultas SQL são mais rápidas
3. **Adiciona funcionalidades**: Busca, estatísticas, relacionamentos
4. **Garante integridade**: Transações e validações automáticas

## Exemplo Completo

Veja o arquivo `src/examples/DatabaseUsageExample.tsx` para um exemplo completo de como usar todas as funcionalidades.

## Vantagens do SQLite

1. **Performance**: 10-100x mais rápido que JSON
2. **Consultas**: SQL permite buscas complexas
3. **Integridade**: Transações garantem consistência
4. **Escalabilidade**: Suporta milhares de gravações
5. **Padrão**: SQL é universalmente conhecido
6. **Manutenção**: Mais fácil de debugar e otimizar

## Próximos Passos

1. **Índices**: Adicionar índices para melhorar performance
2. **Backup**: Implementar backup/restore
3. **Sincronização**: Preparar para sincronização com servidor
4. **Relacionamentos**: Adicionar tabelas para categorias/tags
5. **Versionamento**: Sistema de versionamento de gravações

## Troubleshooting

### Erro de Inicialização
```tsx
// Verificar se o banco foi inicializado
const { isInitialized, error } = useDatabase();
if (error) {
  console.error('Erro no banco:', error);
}
```

### Performance
```tsx
// Para muitas gravações, use paginação
const recordings = await DatabaseService.getAllRecordings();
const page = recordings.slice(0, 20); // Primeiras 20
```

### Debug
```tsx
// Habilitar logs detalhados
console.log('Gravações carregadas:', recordings.length);
console.log('Banco inicializado:', isInitialized);
```

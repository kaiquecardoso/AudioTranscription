# 🔍 Como Verificar se o Banco de Dados Está Funcionando

## 📱 **Método 1: Interface Visual (Mais Fácil)**

1. **Execute o app**: `npm start` ou `expo start`
2. **Navegue para a aba "Banco de Dados"** (ícone de servidor)
3. **Verifique as informações**:
   - Total de gravações
   - Tamanho do arquivo
   - Integridade do banco
   - Lista de gravações

## 🧪 **Método 2: Testes Automáticos**

Adicione este código em qualquer componente para testar:

```tsx
import { DatabaseTester } from './src/utils/databaseTester';

// Em um useEffect ou função
useEffect(() => {
  const testDatabase = async () => {
    const results = await DatabaseTester.runAllTests();
    console.log('Resultados:', results);
  };
  
  testDatabase();
}, []);
```

## 📊 **Método 3: Console Logs**

Adicione logs no seu código:

```tsx
import { useDatabase } from './src/hooks';

const MyComponent = () => {
  const { recordings, isInitialized, error } = useDatabase();
  
  useEffect(() => {
    console.log('🔍 Status do Banco:');
    console.log('Inicializado:', isInitialized);
    console.log('Erro:', error);
    console.log('Gravações:', recordings.length);
  }, [isInitialized, error, recordings]);
  
  // Seu código...
};
```

## 🗂️ **Método 4: Verificar Arquivo Físico**

### **Android:**
- Localização: `/data/data/com.yourapp.package/databases/recordings.db`
- Use: Android Studio Device File Explorer

### **iOS:**
- Localização: `Documents/recordings.db` no sandbox da app
- Use: Xcode Device Window

### **Expo Go:**
- Localização: Sandbox do Expo Go
- Use: Expo Dev Tools ou código

## 🔧 **Método 5: Query SQL Direta**

Use o DatabaseViewer para executar queries:

```sql
-- Ver todas as tabelas
SELECT name FROM sqlite_master WHERE type='table';

-- Ver estrutura da tabela
PRAGMA table_info(recordings);

-- Contar gravações
SELECT COUNT(*) as total FROM recordings;

-- Ver últimas 5 gravações
SELECT * FROM recordings ORDER BY created_at DESC LIMIT 5;
```

## ✅ **Sinais de que o Banco Está Funcionando:**

1. **✅ Inicialização**: Sem erros no console
2. **✅ Criação**: Gravações são salvas
3. **✅ Listagem**: Gravações aparecem na lista
4. **✅ Busca**: Busca retorna resultados
5. **✅ Estatísticas**: Números corretos
6. **✅ Integridade**: Tabela existe e tem estrutura correta

## ❌ **Sinais de Problemas:**

1. **❌ Erro de inicialização**: "Cannot find module 'expo-sqlite'"
2. **❌ Erro de permissão**: "Permission denied"
3. **❌ Erro de SQL**: "SQL error" ou "syntax error"
4. **❌ Dados não salvos**: Gravações desaparecem
5. **❌ Performance lenta**: App trava ao carregar

## 🚨 **Soluções para Problemas Comuns:**

### **Problema: "Cannot find module 'expo-sqlite"**
```bash
npx expo install expo-sqlite
npx expo start --clear
```

### **Problema: Banco não inicializa**
```tsx
// Verificar se DatabaseInitializer está no App.tsx
<DatabaseInitializer>
  <AppContent />
</DatabaseInitializer>
```

### **Problema: Dados não salvam**
```tsx
// Verificar se está usando o hook correto
const { saveRecording } = useDatabase();
// E não o método antigo
```

### **Problema: Performance lenta**
```tsx
// Usar paginação para muitas gravações
const recordings = await DatabaseService.getAllRecordings();
const page = recordings.slice(0, 20);
```

## 📈 **Monitoramento Contínuo:**

Adicione este código para monitorar o banco:

```tsx
import { useDatabase } from './src/hooks';

const DatabaseMonitor = () => {
  const { recordings, isInitialized, error } = useDatabase();
  
  useEffect(() => {
    if (isInitialized) {
      console.log(`📊 Banco OK - ${recordings.length} gravações`);
    } else if (error) {
      console.error(`❌ Banco com erro: ${error}`);
    }
  }, [isInitialized, error, recordings]);
  
  return null; // Componente invisível
};
```

## 🎯 **Teste Rápido (1 minuto):**

1. Abra o app
2. Vá para "Banco de Dados"
3. Clique em "Atualizar Informações"
4. Verifique se mostra "Total de gravações: X"
5. Se mostrar números, o banco está funcionando! ✅

## 📞 **Se Ainda Não Funcionar:**

1. Verifique os logs do console
2. Teste com `DatabaseTester.runAllTests()`
3. Verifique se o `expo-sqlite` está instalado
4. Reinicie o app completamente
5. Verifique se há erros de TypeScript

---

**💡 Dica:** O banco SQLite é criado automaticamente quando você salva a primeira gravação. Se não há gravações ainda, o arquivo pode não existir fisicamente, mas o sistema está funcionando!

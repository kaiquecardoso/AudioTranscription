# 🎙️ AudioEdit - Aplicativo de Gravação e Transcrição de Voz

Um aplicativo React Native moderno para gravação de áudio com transcrição automática usando IA, interface glassmorphism e funcionalidades avançadas de gerenciamento de gravações.

## ✨ Funcionalidades Principais

### 🎤 Gravação de Áudio
- **Gravação em alta qualidade** com suporte a pausa e retomada
- **Interface intuitiva** com controles visuais claros
- **Timer em tempo real** mostrando duração da gravação
- **Gravação contínua** com possibilidade de pausar e retomar
- **Salvamento automático** no armazenamento local do dispositivo

### 🤖 Transcrição Inteligente
- **Transcrição automática** usando OpenAI Whisper API
- **Resumo inteligente** do conteúdo transcrito
- **Processamento em tempo real** após finalizar gravação
- **Configuração personalizável** para ativar/desativar transcrição automática

### 📱 Interface Moderna
- **Design glassmorphism** com efeitos de vidro e blur
- **Tema escuro elegante** com cores vibrantes
- **Animações suaves** e transições fluidas
- **Interface responsiva** adaptada para diferentes tamanhos de tela
- **Navegação por abas** intuitiva

### 🎵 Player de Áudio
- **Reprodução de gravações** com controles play/pause
- **Visualização de transcrição** e resumo
- **Lista organizada** de todas as gravações
- **Ordenação por data** (mais recentes primeiro)

### ⚙️ Configurações Avançadas
- **Transcrição automática** - ativar/desativar
- **Alta qualidade** - gravação em qualidade máxima
- **Salvar na galeria** - exportar para galeria do dispositivo
- **Notificações** - alertas sobre gravações
- **Gerenciamento de dados** - limpar todas as gravações

### 🗂️ Gerenciamento de Arquivos
- **Lista de gravações** com informações detalhadas
- **Exclusão individual** com confirmação
- **Exclusão em lote** de todas as gravações
- **Exportação** de gravações (funcionalidade futura)
- **Armazenamento local** seguro

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native** 0.79.5 - Framework principal
- **TypeScript** 5.6.3 - Tipagem estática
- **React Navigation** 6.x - Navegação entre telas
- **Expo** 53.0.0 - Plataforma de desenvolvimento

### Áudio e Mídia
- **expo-audio** 0.4.9 - Gravação e reprodução de áudio
- **expo-file-system** 18.1.11 - Gerenciamento de arquivos
- **expo-media-library** 17.1.7 - Acesso à biblioteca de mídia

### Interface e UX
- **expo-blur** 14.1.5 - Efeitos de vidro e blur
- **react-native-gesture-handler** 2.24.0 - Gestos e interações
- **react-native-reanimated** 3.17.4 - Animações avançadas
- **@expo/vector-icons** - Ícones do Ionicons

### IA e Processamento
- **OpenAI API** - Transcrição com Whisper
- **FormData** - Upload de arquivos de áudio
- **Fetch API** - Comunicação com APIs externas

### Armazenamento
- **AsyncStorage** 2.1.2 - Persistência de configurações
- **FileSystem** - Armazenamento local de gravações

## 📱 Estrutura do Projeto

```
AudioEdit/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/           # Contextos React (Theme, Settings)
│   │   ├── ThemeContext.tsx    # Gerenciamento de tema
│   │   └── SettingsContext.tsx # Configurações do app
│   ├── screens/            # Telas principais
│   │   ├── RecordingScreen.tsx    # Tela principal de gravações
│   │   ├── RecordingModal.tsx     # Modal de gravação
│   │   └── SettingsScreen.tsx     # Tela de configurações
│   ├── config/             # Configurações
│   │   └── api.js              # Configuração da API OpenAI
│   ├── types/              # Definições de tipos TypeScript
│   └── utils/              # Utilitários e helpers
├── assets/                 # Recursos estáticos
├── App.tsx                 # Componente principal
├── app.json               # Configuração do Expo
└── package.json           # Dependências do projeto
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Expo CLI
- Conta OpenAI (para API de transcrição)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/AudioEdit.git
cd AudioEdit
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure a API OpenAI
Edite o arquivo `src/config/api.js` e adicione sua chave da API:
```javascript
export const API_CONFIG = {
  OPENAI_API_KEY: 'sua-chave-da-api-aqui',
  OPENAI_API_URL: 'https://api.openai.com/v1/audio/transcriptions'
};
```

### 4. Execute o projeto
```bash
npm start
# ou
yarn start
```

### 5. Execute no dispositivo
- **Android**: `npm run android` ou `yarn android`
- **iOS**: `npm run ios` ou `yarn ios`
- **Web**: `npm run web` ou `yarn web`

## 📋 Funcionalidades Detalhadas

### Tela de Gravação (RecordingScreen)
- **Lista de gravações** com cards glassmorphism
- **Botão FAB** para iniciar nova gravação
- **Controles de reprodução** (play/pause/stop)
- **Transcrição e resumo** visíveis em cada gravação
- **Exclusão por swipe** com confirmação
- **Estado vazio** com call-to-action

### Modal de Gravação (RecordingModal)
- **Interface de gravação** com microfone central
- **Timer em tempo real** com formatação MM:SS
- **Controles contextuais** (gravar/pausar/parar)
- **Preview da gravação** com controles de reprodução
- **Transcrição automática** após finalizar
- **Resumo inteligente** do conteúdo
- **Salvamento** com nome e timestamp

### Tela de Configurações (SettingsScreen)
- **Configurações de gravação** (qualidade, transcrição automática)
- **Configurações de interface** (notificações)
- **Ações de gerenciamento** (exportar, limpar dados)
- **Interface glassmorphism** consistente
- **Switches personalizados** com tema

### Contextos e Estado
- **ThemeContext**: Gerenciamento de cores e tema
- **SettingsContext**: Persistência de configurações
- **Estado global** para configurações do usuário

## 🎨 Design System

### Cores Principais
- **Background**: Preto (#000000) com transparências
- **Primary**: Roxo (#a855f7) - ações principais
- **Secondary**: Ciano (#06b6d4) - ações secundárias
- **Tertiary**: Amarelo (#f59e0b) - ações de confirmação
- **Error**: Vermelho (#ef4444) - ações destrutivas

### Efeitos Glassmorphism
- **BlurView** com intensidade 50-80
- **Bordas translúcidas** com rgba
- **Sombras suaves** para profundidade
- **Transparências** em camadas

### Tipografia
- **Títulos**: 24px, peso bold
- **Subtítulos**: 16px, peso 600
- **Corpo**: 14px, peso normal
- **Captions**: 12px, peso normal

## 🔧 Configurações Avançadas

### Permissões Necessárias
- **RECORD_AUDIO**: Para gravação de áudio
- **WRITE_EXTERNAL_STORAGE**: Para salvar arquivos
- **READ_EXTERNAL_STORAGE**: Para acessar arquivos
- **INTERNET**: Para API de transcrição

### Configurações do Expo
- **Orientation**: Portrait
- **UserInterfaceStyle**: Light
- **Plugins**: expo-media-library, expo-audio
- **Permissions**: Configuradas para Android e iOS

## 🚧 Funcionalidades Futuras

- [ ] **Exportação de gravações** para diferentes formatos
- [ ] **Sincronização na nuvem** com backup automático
- [ ] **Compartilhamento** de gravações e transcrições
- [ ] **Filtros e busca** nas gravações
- [ ] **Temas personalizáveis** além do tema escuro
- [ ] **Gravação em background** com notificações
- [ ] **Integração com calendário** para agendamentos
- [ ] **Análise de sentimento** do áudio transcrito

## 🐛 Solução de Problemas

### Problemas Comuns
1. **Erro de permissão de microfone**: Verifique as permissões no dispositivo
2. **Falha na transcrição**: Verifique a chave da API OpenAI
3. **Gravação não salva**: Verifique o espaço em disco
4. **App não inicia**: Execute `npm install` novamente

### Logs e Debug
- Use `console.log` para debug no desenvolvimento
- Verifique o console do Expo para erros
- Teste em dispositivo físico para funcionalidades de áudio

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email
- Consulte a documentação do Expo

---

**Desenvolvido com ❤️ usando React Native e Expo**#   A u d i o T r a n s c r i p t i o n  
 
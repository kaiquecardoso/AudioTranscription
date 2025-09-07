import { API_CONFIG } from '../config/api';

export class OpenAIService {
  private static readonly TRANSCRIPTION_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  private static getHeaders() {
    return {
      'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
    };
  }

  static async transcribeAudio(recordingUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri: recordingUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');

    const response = await fetch(this.TRANSCRIPTION_ENDPOINT, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha na transcrição');
    }

    const data = await response.json();
    return data.text;
  }

  static async generateSummary(transcription: string): Promise<string> {
    const response = await fetch(this.CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analise o seguinte áudio transcrito e crie um resumo estruturado em português. Inclua:\n1. Tópicos principais discutidos\n2. Pontos-chave mencionados\n3. Conclusões ou decisões tomadas\n4. Ações ou próximos passos sugeridos\n\nFormate como um resumo executivo claro e organizado.',
          },
          {
            role: 'user',
            content: `Conteúdo do áudio transcrito:\n\n${transcription}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha na geração do resumo');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static async processRecording(recordingUri: string) {
    try {
      const transcription = await this.transcribeAudio(recordingUri);
      const summary = await this.generateSummary(transcription);
      
      return { transcription, summary };
    } catch (error) {
      console.error('Erro no processamento da gravação:', error);
      throw error;
    }
  }
}

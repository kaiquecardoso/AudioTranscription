import { OpenAIService } from '../services';

// Re-exportar as funções do serviço para manter compatibilidade
export const transcribeAudio = OpenAIService.transcribeAudio.bind(OpenAIService);
export const generateSummary = OpenAIService.generateSummary.bind(OpenAIService);
export const processRecording = OpenAIService.processRecording.bind(OpenAIService);

export type ModelProvider = 'gemini' | 'groq' | 'deepseek';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  modelName: string;
  description: string;
  free: boolean;
  requiresApiKey: boolean;
  maxTokens: number;
  contextWindow: number;
  strengths: string[];
  icon?: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    modelName: 'gemini-2.0-flash',
    description: 'Fast and efficient model by Google',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 1000000,
    strengths: ['Fast', 'Multimodal', 'Google ecosystem']
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    modelName: 'gemini-1.5-flash-8b',
    description: 'Balanced speed and quality',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 1000000,
    strengths: ['Large context', 'Fast', 'Cost-effective']
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    modelName: 'llama-3.3-70b-versatile',
    description: 'Meta\'s most capable open model',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 128000,
    strengths: ['High quality', 'Open source', 'Fast inference']
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'groq',
    modelName: 'llama-3.1-8b-instant',
    description: 'Fast and lightweight',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 128000,
    strengths: ['Very fast', 'Lightweight', 'Low latency']
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    modelName: 'mixtral-8x7b-32768',
    description: 'Expert mixture for diverse tasks',
    free: true,
    requiresApiKey: true,
    maxTokens: 32768,
    contextWindow: 32000,
    strengths: ['Diverse expertise', 'Efficient', 'Good reasoning']
  },
  {
    id: 'gemma-2-9b',
    name: 'Gemma 2 9B',
    provider: 'groq',
    modelName: 'gemma2-9b-it',
    description: 'Google\'s efficient open model',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 8000,
    strengths: ['Efficient', 'Open source', 'Google quality']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    modelName: 'deepseek-reasoner',
    description: 'Advanced reasoning model',
    free: true,
    requiresApiKey: true,
    maxTokens: 8192,
    contextWindow: 64000,
    strengths: ['Advanced reasoning', 'Math', 'Coding']
  }
];

export const DEFAULT_MODEL = 'gemini-2.0-flash';

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

export function getModelsByProvider(provider: ModelProvider): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider);
}

export function getFreeModels(): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.free);
}

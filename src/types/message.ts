export interface Message {
  role: 'user' | 'model';
  content: string;
  memory: string;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

import { Message, GeminiMessage } from "@/types/message";

export function formatMessagesForGemini(messages: Message[]): GeminiMessage[] {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
}

import { formatMessagesForGemini } from "@/utils/formatMessages";
import { buildSystemInstruction } from "@/utils/systemInstruction";
import { generateWithRetry } from "@/lib/ai-service";
import { getModelById } from "@/config/models";
import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/message";

const VALID_ROLES = ["user", "model"] as const;
const MAX_CONTEXT_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 8000;

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_MINUTE = 10;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientId);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  return true;
}

function filterValidMessages(messages: Message[]) {
  return messages.filter((msg) => VALID_ROLES.includes(msg.role));
}

function sanitizeContent(content: string): string {
  if (typeof content !== 'string') return '';
  return content.slice(0, MAX_CONTENT_LENGTH).trim();
}

export async function POST(req: NextRequest) {
  const clientId = getClientIp(req);
  
  if (!checkRateLimit(clientId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { messages, sessionId, model: modelId, apiKeys } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    if (messages.length > MAX_CONTEXT_MESSAGES * 2) {
      return NextResponse.json(
        { error: "Too many messages. Please start a new conversation." },
        { status: 400 }
      );
    }

    const modelConfig = getModelById(modelId || "gemini-2.0-flash");
    const provider = modelConfig?.provider || "gemini";
    const apiKey = apiKeys?.[provider] || process.env.GEMINI_API_KEY;
    
    console.log("Model:", modelId, "Provider:", provider);

    const filteredMessages = filterValidMessages(messages);
    
    if (filteredMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages after filtering." },
        { status: 400 }
      );
    }

    const sanitizedMessages = filteredMessages.map(msg => ({
      ...msg,
      content: sanitizeContent(msg.content)
    })).filter(msg => msg.content.length > 0);

    const recentMessages = sanitizedMessages.slice(-MAX_CONTEXT_MESSAGES);
    const formattedMessages = formatMessagesForGemini(recentMessages);
    const lastMemory = recentMessages[recentMessages.length - 1]?.memory || "No context available";
    const systemInstruction = buildSystemInstruction(lastMemory);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${provider}. Please add your API key in the model settings.` },
        { status: 500 }
      );
    }

    const result = await generateWithRetry({
      systemInstruction,
      contents: formattedMessages,
      model: modelConfig?.modelName
    }, apiKey, modelId);

    return NextResponse.json({ 
      text: result.text,
      provider: result.provider,
      model: modelId,
      sessionId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating content:", message);
    
    if (message.includes("429") || message.includes("quota") || message.includes("rate_limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait and try again." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

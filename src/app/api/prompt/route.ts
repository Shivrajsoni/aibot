import { formatMessagesForGemini } from "@/utils/formatMessages";
import { buildSystemInstruction } from "@/utils/systemInstruction";
import { generateWithRetry } from "@/lib/ai-service";
import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/message";

const VALID_ROLES = ["user", "model"] as const;
const MAX_CONTEXT_MESSAGES = 10;

function filterValidMessages(messages: Message[]) {
  return messages.filter((msg) => VALID_ROLES.includes(msg.role));
}

function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const filteredMessages = filterValidMessages(messages);
    
    if (filteredMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages after filtering." },
        { status: 400 }
      );
    }

    const recentMessages = filteredMessages.slice(-MAX_CONTEXT_MESSAGES);
    const formattedMessages = formatMessagesForGemini(recentMessages);
    const lastMemory = recentMessages[recentMessages.length - 1]?.memory || "No context available";
    const systemInstruction = buildSystemInstruction(lastMemory);

    const apiKey = getApiKey();
    
    const result = await generateWithRetry({
      systemInstruction,
      contents: formattedMessages,
    }, apiKey);

    return NextResponse.json({ 
      text: result.text,
      provider: result.provider 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating content:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

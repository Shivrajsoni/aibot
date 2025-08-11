import { formatMessagesForGemini } from "@/utils/formatMessages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const validRoles = ["user", "model"];

interface Message {
  role: "user" | "model";
  content: string;
  memory: string;
}

function filterValidMessages(messages: Message[]) {
  return messages.filter((msg) => validRoles.includes(msg.role));
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // Filter only valid roles
    const filteredMessages = filterValidMessages(messages);
    const formattedMessages = formatMessagesForGemini(filteredMessages);

    function buildSystemInstruction(messages: Message[]) {
      if (!messages || messages.length === 0) return "Please provide messages";

      const lastMessage = messages[messages.length - 1];
      return `You are a helpful AI assistant. Please format your response using markdown-like syntax for better readability:

1. Use headings with # symbols (e.g., # Main Heading, ## Subheading)
2. Use code blocks with triple backticks for code examples
3. Use single backticks for inline code or technical terms
4. Break down complex information into sections with appropriate headings
5. Use bullet points or numbered lists for step-by-step instructions
6. Keep paragraphs concise and well-structured

The user's memory context is: ${lastMessage.memory}

Please provide a clear, well-formatted response that is easy to read and understand.`.trim();
    }

    const systemInstruction = buildSystemInstruction(filteredMessages);
    const result = await model.generateContent({
      systemInstruction,
      contents: formattedMessages,
    });

    if (!result || !result.response) {
      console.error("error in LLM model ", result);
      return NextResponse.json(
        { error: "No response Generated from LLM" },
        { status: 500 }
      );
    }

    const response = result.response;
    const text = response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error(`Error Generating Content`, error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

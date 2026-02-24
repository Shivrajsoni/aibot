import { GoogleGenerativeAI } from "@google/generative-ai";

export type ModelProvider = "gemini" | "groq" | "deepseek" | "fallback";

export interface AIConfig {
  provider: ModelProvider;
  apiKey?: string;
  modelName?: string;
}

export interface GenerateOptions {
  systemInstruction: string;
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  model?: string;
  apiKey?: string;
}

export interface GenerationResult {
  text: string;
  provider: ModelProvider;
}

const FALLBACK_RESPONSES = [
  "I understand your message. However, I'm currently running in offline mode due to API configuration issues. Please ensure your GEMINI_API_KEY is properly set in the environment variables.",
  "I've received your message! Due to API availability, I'm operating in limited mode. The AI service requires a valid API key to function fully.",
  "Your message has been received. For full AI-powered responses, please configure a valid API key. I'm currently operating in fallback mode.",
  "I see what you're asking. The AI service is currently unavailable, but I'm working with limited capabilities until the connection is restored.",
  "Thanks for your message! To enable full AI functionality, please add a valid GEMINI_API_KEY to your .env file.",
];

const THINGS_TO_DO = [
  "Learn a new programming language concept",
  "Practice coding challenges on LeetCode",
  "Read documentation for your favorite library",
  "Contribute to an open source project",
  "Build a small project to learn something new",
  "Review your recent code for improvements",
  "Write a blog post about something you learned",
  "Refactor a piece of code you've been meaning to fix",
  "Explore a new framework or tool",
  "Pair program with a colleague or friend",
  "Take a break and go for a walk",
  "Listen to a tech podcast",
  "Watch a tutorial on a topic you're curious about",
  "Organize your development environment",
  "Update your portfolio or resume",
];

const RANDOM_FACTS = [
  "The first computer bug was an actual moth found in the Mark II computer in 1947.",
  "Python is named after Monty Python, not the snake.",
  "The first domain name ever registered was symbolics.com in 1985.",
  "Git was created by Linus Torvalds in 2005 for Linux kernel development.",
  "JavaScript was originally called Mocha, then LiveScript.",
  "The average programmer writes about 10-15 lines of code per day.",
  "Ada Lovelace wrote the first algorithm intended for a computer in 1843.",
  "The term 'bug' for a computer error predates electronic computers.",
  "Linux was created by Linus Torvalds as a hobby project in 1991.",
  "The first computer mouse was made of wood.",
  "The Y2K bug cost approximately $300 billion to fix worldwide.",
  "There are over 700 programming languages in existence.",
  "The first high-level programming language was FORTRAN, created in 1957.",
  "GitHub was founded in 2008 and was originally called Logical Awesome.",
  "The term 'software' was first used by John Tukey in 1958.",
  "TypeScript was developed by Microsoft and is a superset of JavaScript.",
  "The first message sent over ARPANET was 'LO' (intended to be LOGIN, but the system crashed).",
  "React was created by Jordan Walke at Facebook in 2011.",
  "The blue screen of death was introduced in Windows 3.0 in 1990.",
  "The first webcam was created at Cambridge University to monitor a coffee pot.",
];

function getRandomFallback(): string {
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[index];
}

export function getRandomThingToDo(): string {
  const index = Math.floor(Math.random() * THINGS_TO_DO.length);
  return THINGS_TO_DO[index];
}

export function getRandomFact(): string {
  const index = Math.floor(Math.random() * RANDOM_FACTS.length);
  return RANDOM_FACTS[index];
}

export async function generateWithGemini(
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  apiKey: string,
  modelName: string = "gemini-2.0-flash"
): Promise<GenerationResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction
  });

  const result = await model.generateContent({
    contents,
  });

  if (!result?.response) {
    throw new Error("No response from Gemini");
  }

  return {
    text: result.response.text(),
    provider: "gemini",
  };
}

export async function generateWithGroq(
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  apiKey: string,
  modelName: string = "llama-3.3-70b-versatile"
): Promise<GenerationResult> {
  const messages = contents.map(msg => ({
    role: msg.role === "model" ? "assistant" : msg.role,
    content: msg.parts.map(p => p.text).join("")
  }));

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 8192,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error("No response from Groq");
  }

  return {
    text: data.choices[0].message.content,
    provider: "groq",
  };
}

export async function generateWithDeepSeek(
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  apiKey: string,
  modelName: string = "deepseek-reasoner"
): Promise<GenerationResult> {
  const messages = contents.map(msg => ({
    role: msg.role === "model" ? "assistant" : msg.role,
    content: msg.parts.map(p => p.text).join("")
  }));

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error("No response from DeepSeek");
  }

  return {
    text: data.choices[0].message.content,
    provider: "deepseek",
  };
}

export function generateFallbackResponse(prompt: string): GenerationResult {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("fact")) {
    return {
      text: `Here's a random fact for you:\n\n${getRandomFact()}`,
      provider: "fallback",
    };
  }
  
  if (lowerPrompt.includes("todo") || lowerPrompt.includes("thing to do") || lowerPrompt.includes("suggestion")) {
    return {
      text: `Here's a suggestion for you:\n\n${getRandomThingToDo()}`,
      provider: "fallback",
    };
  }
  
  if (lowerPrompt.includes("help") || lowerPrompt.includes("what can you do")) {
    return {
      text: `I'm currently running in offline mode. Here's what I can help with even without an API key:

1. **Random Facts** - Ask me for a fact and I'll share an interesting tech trivia!
2. **Things to Do** - Need suggestions? Ask me for things to do and I'll give you ideas!
3. **General Conversation** - I can have basic conversations, though my responses will be limited.

**To enable full AI capabilities:**
- Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Add it to your .env file as \`GEMINI_API_KEY=your_key_here\`
- Restart your development server

Would you like me to share a random fact or suggestion?`,
      provider: "fallback",
    };
  }

  return {
    text: getRandomFallback(),
    provider: "fallback",
  };
}

export async function generateWithRetry(
  options: GenerateOptions,
  apiKey?: string,
  modelId?: string
): Promise<GenerationResult> {
  const trimmedKey = apiKey?.trim() || "";
  const model = options.model || modelId || "gemini-2.0-flash";
  
  console.log("Using model:", model, "API Key present:", !!trimmedKey);
  
  if (!trimmedKey || trimmedKey === "" || trimmedKey.includes("your_")) {
    console.log("No valid API key, using fallback response");
    return generateFallbackResponse(
      options.contents[options.contents.length - 1]?.parts[0]?.text || ""
    );
  }

  try {
    if (model.startsWith("gemini-")) {
      console.log("Attempting to call Gemini API...");
      const result = await generateWithGemini(
        options.systemInstruction,
        options.contents,
        trimmedKey,
        model
      );
      console.log("Gemini API success!");
      return result;
    } else if (model.startsWith("llama-") || model.startsWith("mixtral-") || model.startsWith("gemma2-")) {
      console.log("Attempting to call Groq API...");
      const result = await generateWithGroq(
        options.systemInstruction,
        options.contents,
        trimmedKey,
        model
      );
      console.log("Groq API success!");
      return result;
    } else if (model.startsWith("deepseek-")) {
      console.log("Attempting to call DeepSeek API...");
      const result = await generateWithDeepSeek(
        options.systemInstruction,
        options.contents,
        trimmedKey,
        model
      );
      console.log("DeepSeek API success!");
      return result;
    } else {
      console.log("Unknown model, using Gemini as fallback...");
      const result = await generateWithGemini(
        options.systemInstruction,
        options.contents,
        trimmedKey,
        model
      );
      return result;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("API error:", errorMessage);
    
    if (errorMessage.includes("403") || errorMessage.includes("leaked")) {
      console.log("API key reported as leaked, using fallback");
      return generateFallbackResponse(
        options.contents[options.contents.length - 1]?.parts[0]?.text || ""
      );
    }
    
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate_limit")) {
      console.log("Rate limited, using fallback");
      return {
        text: "⚠️ API Rate Limit Exceeded\n\nYour API key has hit its free tier quota. Options:\n\n1. Wait 1-2 minutes and try again\n2. Get a new API key from the provider\n3. Use offline mode features below:\n\n" + getRandomFallback(),
        provider: "fallback",
      };
    }
    
    console.log("Unknown error, throwing:", errorMessage);
    throw error;
  }
}

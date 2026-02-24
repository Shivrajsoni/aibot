

export function buildSystemInstruction(lastMemory: string): string {
  return `You are a helpful AI assistant. Please format your response using markdown-like syntax for better readability:

1. Use headings with # symbols (e.g., # Main Heading, ## Subheading)
2. Use code blocks with triple backticks for code examples
3. Use single backticks for inline code or technical terms
4. Break down complex information into sections with appropriate headings
5. Use bullet points or numbered lists for step-by-step instructions
6. Keep paragraphs concise and well-structured

The user's memory context is: ${lastMemory}

Please provide a clear, well-formatted response that is easy to read and understand.`.trim();
}

"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Terminal } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "model" | "system";
  content: string;
  provider?: string;
  timestamp?: Date;
}

function parseMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = '';
      } else {
        elements.push(
          <pre key={`code-${codeKey++}`} className="bg-black/80 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono">
            <code className={cn("text-green-400")}>{codeContent}</code>
          </pre>
        );
        inCodeBlock = false;
        codeContent = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold text-yellow-400 mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold text-cyan-400 mt-3 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="text-base font-bold text-green-400 mt-2 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={`li-${i}`} className="ml-4 text-gray-300">{line.slice(2)}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(<li key={`ol-${i}`} className="ml-4 text-gray-300 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
    } else if (line.trim()) {
      const processedLine = line
        .replace(/`([^`]+)`/g, '<code class="bg-black/50 px-1.5 py-0.5 rounded text-pink-400 font-mono text-sm">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      
      elements.push(
        <p 
          key={`p-${i}`} 
          className="text-gray-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    }
  }

  return elements;
}

export function MessageBubble({ role, content, provider }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system" || provider === "fallback";
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(!isUser);

  useEffect(() => {
    if (isUser) {
      setDisplayedContent(content);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [content, isUser]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[85%] rounded-lg bg-blue-600 text-white p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
            <span>❯</span>
            <span>user</span>
          </div>
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div className={cn(
        "max-w-[85%] rounded-lg p-3 shadow-lg border",
        isSystem 
          ? "bg-yellow-900/20 border-yellow-500/30" 
          : "bg-gray-900/80 border-green-500/30"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs opacity-70">
            <Terminal className="w-3 h-3" />
            <span className={isSystem ? "text-yellow-400" : "text-green-400"}>
              {isSystem ? "assistant (offline)" : "assistant"}
            </span>
            {provider && provider !== "fallback" && (
              <span className="text-xs text-blue-400">via {provider}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-50" />}
          </button>
        </div>
        
        <div className="font-mono text-sm">
          {isTyping ? (
            <span className="text-gray-300">
              {displayedContent}
              <span className="animate-pulse text-green-400">▋</span>
            </span>
          ) : (
            parseMarkdown(content)
          )}
        </div>
      </div>
    </div>
  );
}

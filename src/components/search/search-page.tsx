"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/search/search-bar';
import { MessageBubble } from './message-bubble';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion"; 
import { 
  Trash2, 
  Lightbulb, 
  Sparkles, 
  Zap,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from './model-selector';
import { DEFAULT_MODEL } from '@/config/models';

export type SystemPrompts = {
  id?: string;
  role: "user" | "model" | "system";
  content: string;
  memory: string;
  provider?: string;
}

const QUICK_ACTIONS = [
  { icon: Lightbulb, label: "Random Fact", prompt: "Tell me a random fact" },
  { icon: Zap, label: "Things to Do", prompt: "Give me something to do" },
  { icon: Sparkles, label: "What can you do?", prompt: "What can you help me with?" },
];

export function SearchPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<SystemPrompts[]>([]);
  const [userMemory, setUserMemory] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const lastRequestRef = useRef<string>('');

  useEffect(() => {
    const memory = localStorage.getItem('memory') as string;
    setUserMemory(memory || '');
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  const createMessage = useCallback((role: "user" | "model" | "system", content: string, memory: string, provider?: string): SystemPrompts => ({
    role,
    content,
    memory,
    provider
  }), []);

  const handleSearch = async (searchPrompt?: string) => {
    const currentPrompt = searchPrompt || prompt;
    
    if (!currentPrompt.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    if (currentPrompt === lastRequestRef.current && isLoading) {
      return;
    }
    lastRequestRef.current = currentPrompt;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    setIsLoading(true);
    setPrompt('');

    try {
      const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
      const userMessage = createMessage("user", currentPrompt, userMemory);
      const updatedMessages = [...messages, { ...userMessage, id: messageId }];
      setMessages(updatedMessages);

      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: updatedMessages,
          sessionId,
          model: selectedModel,
          apiKeys
        }),
      });

      const data: { text?: string; provider?: string; error?: string } = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, createMessage("model", data.text || "No response", userMemory, data.provider)]);
      
      const providerNames: Record<string, string> = {
        gemini: 'Gemini',
        groq: 'Groq (Llama/Mixtral)',
        deepseek: 'DeepSeek',
        fallback: 'Offline Mode'
      };
      
      toast({
        title: 'Response Ready',
        description: data.provider === 'fallback' 
          ? 'Running in offline mode' 
          : `Response from ${providerNames[data.provider || 'AI']}`,
      });
    } catch (error) {
      console.error('Error fetching prompt response', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      lastRequestRef.current = '';
    }
  };

  const handleQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt);
    handleSearch(actionPrompt);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handlePageClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener('click', handlePageClick);
    return () => {
      document.removeEventListener('click', handlePageClick);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[calc(100vh-8rem)] w-full flex-col"
    >
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {showWelcome && messages.length === 0 ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 dark:from-green-500/30 dark:to-green-700/30 border border-green-400/30 dark:border-green-500/30 mb-4 shadow-lg shadow-green-500/20"
              >
                <span className="text-4xl">❯</span>
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-green-400 mb-2 font-mono tracking-tight">
                Welcome to <span className="text-green-600 dark:text-green-500">Erite</span> Terminal
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-mono mb-4">
                Type a message or use quick actions below
              </p>

              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">Model:</span>
                  <ModelSelector 
                    selectedModel={selectedModel} 
                    onModelChange={setSelectedModel} 
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAction(action.prompt)}
                      className="border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300 font-mono text-sm transition-all duration-300"
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-4 px-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <Cpu className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400 font-mono text-sm">
                    ❯_ session
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">
                    #{sessionId}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-mono">
                    {selectedModel}
                  </span>
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  ({messages.length} messages)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={setSelectedModel} 
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 mb-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || `${msg.role}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  provider={msg.provider}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-green-500/30 rounded-lg p-3 max-w-[85%]">
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-mono">
                  <span className="animate-pulse">▋</span>
                  <span>Thinking...</span>
                  <div className="flex gap-1 ml-2">
                    <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono py-1">Quick:</span>
            {QUICK_ACTIONS.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
                className="border-gray-200 dark:border-green-500/20 text-gray-600 dark:text-green-400/70 hover:bg-gray-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 font-mono text-xs h-7"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </motion.div>
        )}

        <SearchBar
          prompt={prompt}
          setPrompt={setPrompt}
          onSearch={() => handleSearch()}
          isLoading={isLoading}
          ref={inputRef}
          placeholder={messages.length === 0 ? "Type your message here..." : "Continue the conversation..."}
          onKeyDown={handleKeyDown}
        />

        <div className="text-center mt-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">Ctrl</kbd> + <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">Enter</kbd> to send
          </p>
        </div>
      </div>
    </motion.div>
  );
}

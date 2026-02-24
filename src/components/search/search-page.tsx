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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SystemPrompts = {
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
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<SystemPrompts[]>([]);
  const [userMemory, setUserMemory] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

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

    setIsLoading(true);
    setPrompt('');

    try {
      const userMessage = createMessage("user", currentPrompt, userMemory);
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data: { text?: string; provider?: string; error?: string } = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, createMessage("model", data.text || "No response", userMemory, data.provider)]);
      
      toast({
        title: 'Response Ready',
        description: data.provider === 'fallback' ? 'Running in offline mode' : 'AI response received',
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 border border-green-500/30 mb-4">
                <span className="text-3xl">❯</span>
              </div>
              <h1 className="text-2xl font-bold text-green-400 mb-2 font-mono">
                Welcome to Erite Terminal
              </h1>
              <p className="text-gray-400 text-sm font-mono mb-6">
                Type a message or use quick actions below
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => handleQuickAction(action.prompt)}
                    className="border-green-500/30 text-green-400 hover:bg-green-900/30 hover:text-green-300 font-mono text-sm"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
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
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-mono text-sm">
                  ❯_ chat session
                </span>
                <span className="text-gray-500 text-xs">
                  ({messages.length} messages)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 mb-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
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
              <div className="bg-gray-900/80 border border-green-500/30 rounded-lg p-3 max-w-[85%]">
                <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
                  <span className="animate-pulse">▋</span>
                  <span>Thinking...</span>
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
            <span className="text-xs text-gray-500 font-mono py-1">Quick:</span>
            {QUICK_ACTIONS.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
                className="border-green-500/20 text-green-400/70 hover:bg-green-900/20 hover:text-green-400 font-mono text-xs h-7"
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
          <p className="text-xs text-gray-600 font-mono">
            Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">Ctrl</kbd> + <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">Enter</kbd> to send
          </p>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AVAILABLE_MODELS, 
  getModelsByProvider,
  type ModelProvider 
} from '@/config/models';
import { 
  Bot, 
  ChevronDown, 
  Check, 
  Key, 
  Sparkles,
  Cpu,
  Globe,
  Zap,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const providerIcons: Record<ModelProvider, React.ReactNode> = {
  gemini: <Sparkles className="w-4 h-4" />,
  groq: <Zap className="w-4 h-4" />,
  deepseek: <Cpu className="w-4 h-4" />
};

const providerColors: Record<ModelProvider, string> = {
  gemini: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  groq: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  deepseek: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModelProvider | 'all'>('all');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState<string | null>(null);
  
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  useEffect(() => {
    const stored = localStorage.getItem('apiKeys');
    if (stored) {
      setApiKeys(JSON.parse(stored));
    }
  }, []);

  const saveApiKey = (provider: string, key: string) => {
    const updated = { ...apiKeys, [provider]: key };
    setApiKeys(updated);
    localStorage.setItem('apiKeys', JSON.stringify(updated));
    setShowApiKeyInput(null);
  };

  const getApiKey = (provider: string) => {
    return apiKeys[provider] || '';
  };

  const filteredModels = activeTab === 'all' 
    ? AVAILABLE_MODELS 
    : getModelsByProvider(activeTab as ModelProvider);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2 items-center border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300 transition-all font-mono text-sm h-9"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">{currentModel?.name || 'Select Model'}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden rounded-xl border border-green-300 dark:border-green-500 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 font-mono">
            <Bot className="w-5 h-5" />
            AI Model Selector
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className={cn(
              "font-mono text-xs",
              activeTab === 'all' ? "bg-green-500 text-white" : "text-gray-500"
            )}
          >
            All Models
          </Button>
          {(['gemini', 'groq', 'deepseek'] as ModelProvider[]).map((provider) => (
            <Button
              key={provider}
              variant={activeTab === provider ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(provider)}
              className={cn(
                "font-mono text-xs capitalize",
                activeTab === provider ? "bg-green-500 text-white" : "text-gray-500"
              )}
            >
              {providerIcons[provider]}
              <span className="ml-1">{provider}</span>
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {filteredModels.map((model) => {
            const hasApiKey = !!getApiKey(model.provider);
            const isSelected = selectedModel === model.id;
            
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                  isSelected 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                    : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                onClick={() => {
                  if (hasApiKey || !model.requiresApiKey) {
                    onModelChange(model.id);
                    setOpen(false);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {model.name}
                      </h3>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        providerColors[model.provider]
                      )}>
                        {model.provider}
                      </span>
                      {model.free && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-600">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.strengths.map((strength) => (
                        <span 
                          key={strength}
                          className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {!hasApiKey && model.requiresApiKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-mono border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowApiKeyInput(model.provider);
                        }}
                      >
                        <Key className="w-3 h-3 mr-1" />
                        Add Key
                      </Button>
                    )}
                    {hasApiKey && (
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Check className="w-3 h-3" />
                        <span className="font-mono">Key saved</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:justify-end mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Globe className="w-3 h-3" />
            <span>Free models available without API key</span>
          </div>
        </DialogFooter>
      </DialogContent>

      {showApiKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-green-300 dark:border-green-500"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 font-mono flex items-center gap-2">
              <Key className="w-5 h-5 text-green-500" />
              Add API Key for {showApiKeyInput}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Get your free API key from the official website.
            </p>
            
            <div className="flex gap-2 mb-4">
              {showApiKeyInput === 'gemini' && (
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  Get Gemini Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {showApiKeyInput === 'groq' && (
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  Get Groq Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {showApiKeyInput === 'deepseek' && (
                <a 
                  href="https://platform.deepseek.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  Get DeepSeek Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <Input
              type="password"
              placeholder="Paste your API key here..."
              className="mb-4 font-mono text-sm"
              id="apiKeyInput"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowApiKeyInput(null)}
                className="text-gray-600 dark:text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('apiKeyInput') as HTMLInputElement;
                  if (input?.value) {
                    saveApiKey(showApiKeyInput, input.value);
                  }
                }}
                className="bg-green-500 text-white hover:bg-green-600 font-mono"
              >
                Save Key
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
}

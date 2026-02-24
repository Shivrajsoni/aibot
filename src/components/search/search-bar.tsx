import { ChangeEvent, KeyboardEvent, forwardRef, useState } from 'react';
import { Send, Terminal, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  placeholder?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const SearchBar = forwardRef<HTMLTextAreaElement, SearchBarProps>(
  ({ prompt, setPrompt, onSearch, isLoading, placeholder, onKeyDown }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSearch();
      }
      onKeyDown?.(e);
    };

    const handleSubmit = () => {
      if (!isLoading && prompt.trim()) {
        onSearch();
      }
    };

    return (
      <div className={cn(
        "relative rounded-xl border-2 transition-all duration-300 overflow-hidden terminal-glow",
        isFocused 
          ? "border-green-500 dark:border-green-500 border-green-400" 
          : "border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-900/80"
      )}>
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 dark:border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <Terminal className="w-4 h-4 text-gray-400 ml-2" />
          </div>
          
          <div className="flex-1 relative">
            <textarea
              ref={ref}
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder || "Type your message..."}
              className="w-full min-h-16 max-h-48 resize-none border-0 p-4 text-base md:text-lg bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-200"
              disabled={isLoading}
              rows={1}
            />
          </div>

          <div className="pr-3">
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className={cn(
                "h-10 w-10 rounded-lg transition-all duration-300",
                prompt.trim() && !isLoading
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 pb-2 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1 font-mono">
            <Command className="w-3 h-3" />
            <span>+</span>
            <span>Enter</span>
            <span className="ml-2 opacity-60">to send</span>
          </div>
          <div className="flex items-center gap-1 opacity-60">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>ready</span>
          </div>
        </div>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

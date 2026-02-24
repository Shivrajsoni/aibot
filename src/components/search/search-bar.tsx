import { ChangeEvent, KeyboardEvent, forwardRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

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
    
    const [isFocused, setIsFocused] = useState(false);

    return (
      <Card className={`relative border-2 transition-all duration-300 ${isFocused ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'} bg-gray-900/80`} >
        <CardContent className="p-0">
          <div className="relative">
            <Textarea
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Type your message..."}
              className="min-h-20 resize-none border-0 p-4 text-base shadow-none focus:ring-0 md:text-lg bg-transparent text-gray-200 placeholder:text-gray-500 font-mono"
              disabled={isLoading}
            />
            <Button
              className="absolute bottom-3 right-3 h-10 rounded-lg px-4 py-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-300 sm:px-6 disabled:opacity-50" 
              onClick={onSearch}
              disabled={isLoading || !prompt.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

SearchBar.displayName = 'SearchBar';

"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ResultDisplayProps {
  result: string;
  isLoading: boolean;
}

function CodeBlock({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return !inline && match ? (
    <div className="relative my-4 rounded-lg bg-muted font-mono text-sm">
      <div className="flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2 text-xs text-white">
        <span>{match[1]}</span>
        <button onClick={handleCopy} className="text-white">
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={coldarkDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={cn(className, "rounded bg-muted px-1 py-0.5 font-mono text-sm")} {...props}>
      {children}
    </code>
  );
}

export function ResultDisplay({ result, isLoading }: ResultDisplayProps) {
  return (
    <Card className="border-2 transition-all duration-300 ease-in-out">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Result</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: (props) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                h2: (props) => <h2 className="text-xl font-bold mb-4" {...props} />,
                h3: (props) => <h3 className="text-lg font-bold mb-4" {...props} />,
                p: (props) => <p className="mb-4 leading-relaxed" {...props} />,
                code: CodeBlock,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

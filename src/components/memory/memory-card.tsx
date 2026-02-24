'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Brain } from 'lucide-react';

export default function MemoryCard() {
  const [open, setOpen] = useState(false);
  const [memory, setMemory] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('memory');
    if (stored) {
      setMemory(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('memory', memory);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 items-center border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300 transition-all font-mono text-sm"
        >
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">Memory</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] rounded-xl border border-green-300 dark:border-green-500 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 font-mono">
            <Brain className="w-5 h-5" />
            Memory Card
          </DialogTitle>
        </DialogHeader>

        <Textarea
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          placeholder="e.g., respond in casual tone with GenZ humor..."
          className="min-h-[120px] text-sm border-2 border-green-200 dark:border-green-700 focus:ring-green-400 dark:focus:ring-green-500 font-mono bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />

        <DialogFooter className="gap-2 sm:justify-end mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-gray-600 dark:text-gray-400">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 text-white hover:bg-green-700 font-mono">
            Save Memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

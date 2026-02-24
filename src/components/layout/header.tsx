"use client";
import { Terminal, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes'; 
import MemoryCard from '../memory/memory-card';
import { motion } from "framer-motion";

export function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const starContainer = document.querySelector('.star-container');
    if (starContainer && mounted) {
      const existingStars = starContainer.children;
      if (existingStars.length === 0) {
        const numberOfStars = 50;

        for (let i = 0; i < numberOfStars; i++) {
          const star = document.createElement('div');
          star.classList.add('star');
          star.style.left = `${Math.random() * 100}vw`;
          star.style.top = `${Math.random() * 100}vh`;
          star.style.animationDuration = `${Math.random() * 5 + 3}s`;
          star.style.animationDelay = `${Math.random() * 5}s`;
          star.style.width = `${Math.random() * 2 + 1}px`;
          star.style.height = star.style.width;
          starContainer.appendChild(star);
        }
      }
    }
  }, [mounted]);

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-900/30 border border-green-500/30">
              <Terminal className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-green-400 font-bold text-xl tracking-wide font-mono">
              erite<span className="text-green-500">_</span>
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            <MemoryCard />
            <ThemeToggle />
          </motion.div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t p-4 flex flex-col gap-4"
          >
            <MemoryCard />
            <ThemeToggle />
          </motion.div>
        )}
      </motion.header>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`star-container ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
      />
    </>
  );
}

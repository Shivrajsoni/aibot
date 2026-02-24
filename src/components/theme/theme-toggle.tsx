"use client";
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme/theme-provider';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === 'light') return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DropdownMenuItem 
          onClick={() => setTheme('light')} 
          className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')} 
          className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')} 
          className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-800"
        >
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

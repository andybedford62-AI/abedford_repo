"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Command } from "lucide-react";

export function Topbar({ title }: { title?: string }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0a0a1a] border-b border-gray-100 dark:border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
      {title && (
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mr-4">{title}</h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, projects, messages..."
            className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-nexus-500 ring-2 ring-white dark:ring-[#0a0a1a]" />
        </button>
      </div>
    </header>
  );
}

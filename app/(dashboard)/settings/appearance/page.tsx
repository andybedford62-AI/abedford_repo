"use client";

import { useState, useEffect } from "react";
import { Palette, ArrowLeft, Sun, Moon, Monitor, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
  }
  localStorage.setItem("nexus-theme", theme);
}

const THEMES: { value: Theme; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", desc: "Always use light mode", icon: Sun },
  { value: "dark", label: "Dark", desc: "Always use dark mode", icon: Moon },
  { value: "system", label: "System", desc: "Follow your device setting", icon: Monitor },
];

export default function AppearancePage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nexus-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  const handleTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Appearance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize how NexusAI looks for you</p>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Theme</h2>
        <p className="text-xs text-gray-400 mb-5">Select your preferred color scheme</p>

        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleTheme(value)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
                theme === value
                  ? "border-nexus-500 bg-nexus-50 dark:bg-nexus-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {theme === value && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-nexus-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                theme === value
                  ? "bg-gradient-to-br from-nexus-500 to-violet-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </button>
          ))}
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-4">
            <Check className="w-4 h-4" /> Theme updated
          </div>
        )}
      </div>

      {/* Display density */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Display</h2>
        <p className="text-xs text-gray-400 mb-4">Adjust the interface density</p>
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Compact mode</div>
            <div className="text-xs text-gray-400 mt-0.5">Reduce spacing for more content on screen</div>
          </div>
          <span className="text-xs text-gray-400 italic">Coming soon</span>
        </div>
      </div>
    </div>
  );
}

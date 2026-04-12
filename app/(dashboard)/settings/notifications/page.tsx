"use client";

import { useState } from "react";
import { Bell, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Toggle {
  id: string;
  label: string;
  desc: string;
}

const EMAIL_NOTIFICATIONS: Toggle[] = [
  { id: "email_projects", label: "Project updates", desc: "When a project is created, updated, or archived" },
  { id: "email_tasks", label: "Task assignments", desc: "When a task is assigned to you or updated" },
  { id: "email_mentions", label: "Mentions", desc: "When someone mentions you in a comment or chat" },
  { id: "email_digest", label: "Weekly digest", desc: "A weekly summary of activity in your workspace" },
];

const APP_NOTIFICATIONS: Toggle[] = [
  { id: "app_tasks", label: "Task updates", desc: "Real-time updates on tasks you're involved in" },
  { id: "app_messages", label: "New messages", desc: "Notifications for new team chat messages" },
  { id: "app_mentions", label: "Mentions", desc: "When someone mentions you" },
  { id: "app_ai", label: "AI responses", desc: "When the AI assistant completes a long-running task" },
];

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
        enabled ? "bg-gradient-to-r from-nexus-500 to-violet-600" : "bg-gray-200 dark:bg-gray-700"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
        enabled && "translate-x-5"
      )} />
    </button>
  );
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email_projects: true,
    email_tasks: true,
    email_mentions: true,
    email_digest: false,
    app_tasks: true,
    app_messages: true,
    app_mentions: true,
    app_ai: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setPrefs((p) => ({ ...p, [id]: !p[id] }));

  const save = () => {
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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Choose what you want to be notified about</p>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Email Notifications</h2>
        <div className="space-y-4">
          {EMAIL_NOTIFICATIONS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <ToggleSwitch enabled={prefs[item.id]} onChange={() => toggle(item.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* In-App */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-4">In-App Notifications</h2>
        <div className="space-y-4">
          {APP_NOTIFICATIONS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <ToggleSwitch enabled={prefs[item.id]} onChange={() => toggle(item.id)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-nexus-500/20"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

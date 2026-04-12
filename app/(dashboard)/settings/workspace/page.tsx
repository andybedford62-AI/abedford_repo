"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings/workspace")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setSlug(data.slug ?? "");
        setDescription(data.description ?? "");
        setPlan(data.plan ?? "FREE");
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/settings/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(data.error || "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-nexus-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Workspace</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your workspace details</p>
        </div>
      </div>

      {/* General */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
            {name ? name[0].toUpperCase() : "W"}
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white text-sm">{name}</div>
            <div className="text-xs text-gray-400">nexusai.app/{slug}</div>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {plan}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Workspace Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              URL Slug
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <span className="px-3 py-2.5 text-sm text-gray-400 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                nexusai.app/
              </span>
              <input
                value={slug}
                disabled
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Slug cannot be changed after creation</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does your team work on?"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400 resize-none transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-nexus-500/20"
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : saving ? (
              "Saving..."
            ) : (
              <><Save className="w-4 h-4" /> Save changes</>
            )}
          </button>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">Subscription Plan</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You are on the <span className="font-semibold text-gray-900 dark:text-white">{plan}</span> plan
          </p>
          <Link
            href="/settings/billing"
            className="text-sm font-medium text-nexus-600 dark:text-nexus-400 hover:underline"
          >
            Manage billing →
          </Link>
        </div>
      </div>
    </div>
  );
}

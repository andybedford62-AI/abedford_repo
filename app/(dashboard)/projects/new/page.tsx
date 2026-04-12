"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Loader2, ArrowLeft, Check, LayoutList, Bug, CalendarDays, BarChart3, Layers } from "lucide-react";
import Link from "next/link";

const PROJECT_COLORS = [
  "#6272f5", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#64748b", "#14b8a6", "#f97316",
];

type Template = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  columns: { name: string; color: string }[];
};

const TEMPLATES: Template[] = [
  {
    id: "kanban",
    name: "Kanban Board",
    description: "Visualize work as it flows through stages. Best for ongoing work.",
    icon: LayoutList,
    color: "#6272f5",
    columns: [
      { name: "To Do", color: "#64748b" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "In Review", color: "#f59e0b" },
      { name: "Done", color: "#10b981" },
    ],
  },
  {
    id: "scrum",
    name: "Scrum Sprint",
    description: "Backlog-driven sprints with clear stages. Best for agile teams.",
    icon: BarChart3,
    color: "#8b5cf6",
    columns: [
      { name: "Backlog", color: "#94a3b8" },
      { name: "Sprint", color: "#6272f5" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "In Review", color: "#f59e0b" },
      { name: "Done", color: "#10b981" },
    ],
  },
  {
    id: "simple",
    name: "Simple To-Do",
    description: "Three columns: To Do, Doing, Done. Great for personal projects.",
    icon: Layers,
    color: "#10b981",
    columns: [
      { name: "To Do", color: "#64748b" },
      { name: "Doing", color: "#3b82f6" },
      { name: "Done", color: "#10b981" },
    ],
  },
  {
    id: "bugs",
    name: "Bug Tracker",
    description: "Track issues from discovery to resolution. Best for dev teams.",
    icon: Bug,
    color: "#ef4444",
    columns: [
      { name: "New", color: "#ef4444" },
      { name: "Confirmed", color: "#f59e0b" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "Fixed", color: "#8b5cf6" },
      { name: "Closed", color: "#10b981" },
    ],
  },
  {
    id: "content",
    name: "Content Calendar",
    description: "Plan and publish content from ideas to live. Best for marketing.",
    icon: CalendarDays,
    color: "#ec4899",
    columns: [
      { name: "Ideas", color: "#94a3b8" },
      { name: "Writing", color: "#6272f5" },
      { name: "Review", color: "#f59e0b" },
      { name: "Scheduled", color: "#8b5cf6" },
      { name: "Published", color: "#10b981" },
    ],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, columns: selectedTemplate.columns }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create project");
        setLoading(false);
        return;
      }

      router.push(`/projects/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto page-enter">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step >= s
                ? "bg-gradient-to-br from-nexus-500 to-violet-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            }`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
              {s === 1 ? "Choose Template" : "Project Details"}
            </span>
            {s < 2 && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 ml-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: (step === 2 ? form.color : selectedTemplate.color) + "20" }}
            >
              <FolderKanban className="w-5 h-5" style={{ color: step === 2 ? form.color : selectedTemplate.color }} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {step === 1 ? "Choose a Template" : "Configure Your Project"}
              </h1>
              <p className="text-xs text-gray-400">
                {step === 1 ? "Pick a starting structure — you can customize columns later" : "Fill in the details to get started"}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Template picker */}
        {step === 1 && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate.id === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-nexus-400 dark:border-nexus-600 bg-nexus-50 dark:bg-nexus-950/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: template.color + "20" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: template.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-nexus-500 flex items-center justify-center flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {template.columns.map((col) => (
                            <span
                              key={col.name}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white"
                              style={{ backgroundColor: col.color }}
                            >
                              {col.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-nexus-500/25"
              >
                Continue with {selectedTemplate.name}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Project details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Selected template reminder */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: selectedTemplate.color + "20" }}>
                <selectedTemplate.icon className="w-3 h-3" style={{ color: selectedTemplate.color }} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Template: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedTemplate.name}</span>
                {" · "}
                {selectedTemplate.columns.length} columns
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="ml-auto text-xs text-nexus-600 dark:text-nexus-400 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Project name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Website Redesign, Mobile App v2"
                required
                maxLength={100}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this project about? What are the goals?"
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors text-sm resize-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: form.color === color ? `3px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Due date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-nexus-500/25"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderKanban className="w-4 h-4" />}
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

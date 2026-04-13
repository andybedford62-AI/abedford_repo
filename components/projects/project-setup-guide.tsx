"use client";

import { useState } from "react";
import {
  Rocket, Plus, Trash2, CheckCircle2, ArrowRight,
  Target, Users, Calendar, Loader2, Sparkles,
} from "lucide-react";

interface SetupTask {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface Column {
  id: string;
  name: string;
  color: string;
}

interface ProjectSetupGuideProps {
  project: { id: string; name: string; color: string; description?: string | null };
  firstColumn: Column;
  allColumns: Column[];
  members: { id: string; name: string | null; image: string | null }[];
  onComplete: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "text-slate-500", dot: "bg-slate-400" },
  { value: "MEDIUM", label: "Medium", color: "text-blue-600", dot: "bg-blue-500" },
  { value: "HIGH", label: "High", color: "text-orange-600", dot: "bg-orange-500" },
  { value: "URGENT", label: "Urgent", color: "text-red-600", dot: "bg-red-500" },
] as const;

const STARTER_PLACEHOLDERS = [
  "Define project scope and requirements",
  "Set up development environment",
  "Create initial wireframes or designs",
  "Schedule kickoff meeting with team",
  "Identify key stakeholders",
];

export function ProjectSetupGuide({ project, firstColumn, allColumns, members, onComplete }: ProjectSetupGuideProps) {
  const [tasks, setTasks] = useState<SetupTask[]>([
    { id: "1", title: "", priority: "MEDIUM" },
    { id: "2", title: "", priority: "MEDIUM" },
    { id: "3", title: "", priority: "MEDIUM" },
  ]);
  const [goal, setGoal] = useState(project.description ?? "");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"tasks" | "review">("tasks");

  const filledTasks = tasks.filter((t) => t.title.trim().length > 0);

  const addRow = () => {
    setTasks((prev) => [...prev, { id: Date.now().toString(), title: "", priority: "MEDIUM" }]);
  };

  const removeRow = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, field: keyof SetupTask, value: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleLaunch = async () => {
    if (filledTasks.length === 0) { onComplete(); return; }
    setSaving(true);

    try {
      await Promise.all(
        filledTasks.map((task, i) =>
          fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project.id,
              columnId: firstColumn.id,
              title: task.title.trim(),
              priority: task.priority,
              order: i,
            }),
          })
        )
      );
      onComplete();
    } catch {
      setSaving(false);
    }
  };

  const checklist = [
    { done: true, label: "Project created with template", sub: `${allColumns.length} columns ready` },
    { done: filledTasks.length > 0, label: "Add your first tasks", sub: filledTasks.length > 0 ? `${filledTasks.length} task${filledTasks.length !== 1 ? "s" : ""} ready to add` : "Minimum 1 required" },
    { done: goal.trim().length > 0, label: "Define the project goal", sub: goal.trim() ? "Goal set" : "Optional but recommended" },
    { done: members.length > 1, label: "Team members available", sub: members.length > 1 ? `${members.length} people can be assigned` : "Invite members from the Team page" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${project.color}, #7c3aed)` }}
          >
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            Set up <span style={{ color: project.color }}>{project.name}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Add a few tasks to get your board running. You can always add more later.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Setup checklist */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Setup Checklist</h3>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.done
                        ? "bg-green-500"
                        : "border-2 border-gray-200 dark:border-gray-700"
                    }`}>
                      {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${item.done ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column preview */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Board Columns</h3>
                <div className="space-y-1.5">
                  {allColumns.map((col, i) => (
                    <div key={col.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{col.name}</span>
                      {i === 0 && (
                        <span className="ml-auto text-[10px] font-semibold text-nexus-600 dark:text-nexus-400 bg-nexus-50 dark:bg-nexus-950/30 px-1.5 py-0.5 rounded">
                          start here
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Task entry */}
          <div className="lg:col-span-2 space-y-4">
            {/* Goal input */}
            <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Target className="w-4 h-4 text-nexus-500" />
                Project Goal
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder='e.g. "Launch the new website by end of Q2"'
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors"
              />
            </div>

            {/* Task entry */}
            <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-nexus-500" />
                  Add Your First Tasks
                </label>
                <span className="text-xs text-gray-400">Tasks start in <strong className="text-gray-600 dark:text-gray-300">{firstColumn.name}</strong></span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Task Title</div>
                <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</div>
                <div className="col-span-1" />
              </div>

              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <div key={task.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(task.id, "title", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRow();
                          }
                        }}
                        placeholder={STARTER_PLACEHOLDERS[i % STARTER_PLACEHOLDERS.length]}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors"
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, "priority", e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 transition-colors"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeRow(task.id)}
                        className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addRow}
                className="mt-3 flex items-center gap-1.5 text-xs text-nexus-600 dark:text-nexus-400 hover:text-nexus-700 transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another task (or press Enter)
              </button>

              {/* What's required info box */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Required</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Project name + 1 task</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Recommended</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Goal + assignees</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <Calendar className="w-4 h-4 text-nexus-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Optional</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Due dates + labels</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLaunch}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-nexus-500/25"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Launching board...</>
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Launch Board{filledTasks.length > 0 ? ` with ${filledTasks.length} task${filledTasks.length !== 1 ? "s" : ""}` : ""}</>
                )}
              </button>
              <button
                onClick={onComplete}
                className="px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

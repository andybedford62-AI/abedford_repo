"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X, Trash2, User, Calendar, Flag, Layers, Loader2,
  MessageSquare, Send, ChevronDown, Sparkles, Pencil,
  Eye, AlertCircle,
} from "lucide-react";
import { cn, generateInitials } from "@/lib/utils";

interface Member { id: string; name: string | null; image: string | null; email?: string }
interface Col { id: string; name: string; color: string }
interface Comment {
  id: string; content: string; createdAt: string;
  author: { id: string; name: string | null; image: string | null };
}
interface FullTask {
  id: string; title: string; description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: string; dueDate: string | null; columnId: string; tags: string[];
  assignee: Member | null;
  creator: { id: string; name: string | null; image: string | null };
  column: Col;
  project: { id: string; name: string; color: string; columns: Col[] };
  comments: Comment[];
  createdAt: string; updatedAt: string;
}

const PRIORITY_CONFIG = {
  LOW:    { label: "Low",    color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800",      dot: "bg-slate-400" },
  MEDIUM: { label: "Medium", color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30",     dot: "bg-blue-500" },
  HIGH:   { label: "High",   color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", dot: "bg-orange-500" },
  URGENT: { label: "Urgent", color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/30",       dot: "bg-red-500" },
};

function Avatar({ user, size = "sm" }: { user: { name: string | null; image: string | null } | null; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
  if (!user) return (
    <div className={cn(sz, "rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0")}>
      <User className="w-3 h-3 text-gray-400" />
    </div>
  );
  return (
    <div className={cn(sz, "rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden")}>
      {user.image
        ? <img src={user.image} alt="" className="w-full h-full object-cover" />
        : generateInitials(user.name ?? "U")}
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return fmtDate(iso);
}

/* ── Markdown renderer ─────────────────────────────────── */
function MarkdownView({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-base font-extrabold text-gray-900 dark:text-white mt-4 mb-1.5 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mt-5 mb-1.5 first:mt-0 uppercase tracking-wide">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-3 mb-1">{children}</h3>,
        p: ({ children }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2.5 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 mb-3 ml-4 list-decimal">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-nexus-400 flex-shrink-0" />
            <span className="flex-1">{children}</span>
          </li>
        ),
        input: ({ type, checked }) =>
          type === "checkbox" ? (
            <input
              type="checkbox"
              checked={checked ?? false}
              readOnly
              className="mt-0.5 w-3.5 h-3.5 rounded accent-nexus-500 flex-shrink-0 cursor-default"
            />
          ) : null,
        strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
        code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono text-nexus-600 dark:text-nexus-400">{children}</code>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-nexus-300 dark:border-nexus-700 pl-3 my-2 italic text-gray-500 dark:text-gray-400 text-sm">{children}</blockquote>,
        hr: () => <hr className="border-gray-200 dark:border-gray-700 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ── AI Generate panel ─────────────────────────────────── */
function AiGeneratePanel({
  taskTitle,
  projectName,
  onGenerated,
  onCancel,
}: {
  taskTitle: string;
  projectName: string;
  onGenerated: (text: string) => void;
  onCancel: () => void;
}) {
  const [context, setContext] = useState(taskTitle);
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/task-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: context, context: extra || undefined, projectName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onGenerated(data.description);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border-2 border-nexus-300 dark:border-nexus-700 bg-nexus-50 dark:bg-nexus-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-nexus-700 dark:text-nexus-300">AI Task Assistant</span>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
          What should this task accomplish?
        </label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the task goal…"
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
          Additional context <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="Technical constraints, user type, related features, sprint goal…"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 transition-colors resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={generate}
          disabled={loading || !context.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? "Generating…" : "Generate"}
        </button>
        <button onClick={onCancel} disabled={loading} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Cancel
        </button>
        {loading && (
          <span className="text-xs text-nexus-600 dark:text-nexus-400 animate-pulse ml-1">
            Claude is writing your task…
          </span>
        )}
      </div>

      <p className="text-[10px] text-gray-400">
        Generates: User Story · Description · Acceptance Criteria (5 items)
      </p>
    </div>
  );
}

/* ── Main Panel ────────────────────────────────────────── */
interface TaskDetailPanelProps {
  taskId: string;
  members: Member[];
  currentUserId: string;
  onClose: () => void;
  onUpdate: (taskId: string, changes: Partial<FullTask>, newColumnId?: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailPanel({ taskId, members, currentUserId, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [task, setTask] = useState<FullTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Title
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Description
  const [descMode, setDescMode] = useState<"view" | "edit">("view");
  const [descDraft, setDescDraft] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Comments
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Auto-resize textarea */
  const resizeDesc = useCallback(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(220, el.scrollHeight) + "px";
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data: FullTask) => {
        setTask(data);
        setTitleDraft(data.title);
        setDescDraft(data.description ?? "");
        setDescMode(data.description ? "view" : "edit");
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      const len = titleRef.current.value.length;
      titleRef.current.setSelectionRange(len, len);
    }
  }, [editingTitle]);

  useEffect(() => {
    if (descMode === "edit") {
      setTimeout(() => { descRef.current?.focus(); resizeDesc(); }, 50);
    }
  }, [descMode, resizeDesc]);

  const patch = async (field: string, value: unknown) => {
    if (!task) return;
    setSaving(field);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTask((prev) => prev ? { ...prev, ...updated } : prev);
      onUpdate(taskId, { [field]: value }, field === "columnId" ? (value as string) : undefined);
    }
    setSaving(null);
  };

  const saveTitle = async () => {
    setEditingTitle(false);
    if (!task || !titleDraft.trim() || titleDraft.trim() === task.title) {
      setTitleDraft(task?.title ?? "");
      return;
    }
    await patch("title", titleDraft.trim());
  };

  const saveDesc = async () => {
    if (!task) return;
    const val = descDraft.trim() || null;
    if (val === (task.description ?? null)) { setDescMode(val ? "view" : "edit"); return; }
    await patch("description", val);
    setDescMode(val ? "view" : "edit");
  };

  const handleAiGenerated = (text: string) => {
    setDescDraft(text);
    setShowAiPanel(false);
    setDescMode("edit");
    setTimeout(resizeDesc, 50);
  };

  const postComment = async () => {
    if (!commentText.trim() || !task) return;
    setPostingComment(true);
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      setTask((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
      setCommentText("");
    }
    setPostingComment(false);
  };

  const deleteComment = async (commentId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) setTask((prev) => prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : prev);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) { onDelete(taskId); onClose(); }
    else setDeleting(false);
  };

  /* ── Render ── */
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-nexus-500" />
    </div>
  );
  if (!task) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">Task not found.</div>
  );

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0d0d21]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
          <span className="font-semibold truncate" style={{ color: task.project.color }}>{task.project.name}</span>
          <span>/</span>
          <span className="truncate">{task.column.name}</span>
          {saving && <span className="ml-2 text-nexus-500 animate-pulse font-medium">Saving…</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handleDelete} disabled={deleting} title="Delete task"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Title */}
        <div>
          {editingTitle ? (
            <textarea
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveTitle(); }
                if (e.key === "Escape") { setTitleDraft(task.title); setEditingTitle(false); }
              }}
              rows={2}
              className="w-full text-xl font-extrabold text-gray-900 dark:text-white bg-transparent border-2 border-nexus-400 rounded-xl px-3 py-2 focus:outline-none resize-none leading-snug"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xl font-extrabold text-gray-900 dark:text-white cursor-text hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl px-3 py-2 -mx-3 transition-colors leading-snug"
            >
              {task.title}
            </h2>
          )}
          <p className="text-[11px] text-gray-400 mt-1 px-1">
            Created by <span className="font-medium text-gray-500 dark:text-gray-400">{task.creator.name}</span> · {fmtDate(task.createdAt)}
          </p>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Status */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <Layers className="w-3 h-3" /> Status
            </label>
            <div className="relative">
              <select
                value={task.columnId}
                onChange={(e) => {
                  const col = task.project.columns.find((c) => c.id === e.target.value);
                  setTask((p) => p ? { ...p, columnId: e.target.value, column: col ?? p.column } : p);
                  patch("columnId", e.target.value);
                }}
                className="w-full pl-3 pr-7 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
              >
                {task.project.columns.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <Flag className="w-3 h-3" /> Priority
            </label>
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => {
                  setTask((p) => p ? { ...p, priority: e.target.value as FullTask["priority"] } : p);
                  patch("priority", e.target.value);
                }}
                className="w-full pl-3 pr-7 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
              >
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <User className="w-3 h-3" /> Assignee
            </label>
            <div className="relative">
              <select
                value={task.assignee?.id ?? ""}
                onChange={(e) => {
                  const m = members.find((m) => m.id === e.target.value) ?? null;
                  setTask((p) => p ? { ...p, assignee: m } : p);
                  patch("assigneeId", e.target.value || null);
                }}
                className="w-full pl-3 pr-7 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <Calendar className="w-3 h-3" /> Due Date
            </label>
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
              onChange={(e) => {
                setTask((p) => p ? { ...p, dueDate: e.target.value || null } : p);
                patch("dueDate", e.target.value || null);
              }}
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", priorityConfig.bg, priorityConfig.color)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dot)} />
            {priorityConfig.label} Priority
          </span>
          {task.dueDate && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              new Date(task.dueDate) < new Date()
                ? "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            )}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate) < new Date() ? "Overdue · " : "Due "}{fmtDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* ── Description ── */}
        <div>
          {/* Label row */}
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
            <div className="flex items-center gap-1">
              {/* AI button */}
              <button
                onClick={() => { setDescMode("edit"); setShowAiPanel((v) => !v); }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  showAiPanel
                    ? "bg-nexus-500 text-white"
                    : "text-nexus-600 dark:text-nexus-400 hover:bg-nexus-50 dark:hover:bg-nexus-950/30 border border-nexus-200 dark:border-nexus-800"
                )}
              >
                <Sparkles className="w-3 h-3" />
                Generate with AI
              </button>
              {/* Edit / Preview toggle */}
              {task.description && (
                <button
                  onClick={() => setDescMode(descMode === "edit" ? "view" : "edit")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {descMode === "edit" ? <><Eye className="w-3 h-3" /> Preview</> : <><Pencil className="w-3 h-3" /> Edit</>}
                </button>
              )}
            </div>
          </div>

          {/* AI panel */}
          {showAiPanel && (
            <AiGeneratePanel
              taskTitle={task.title}
              projectName={task.project.name}
              onGenerated={handleAiGenerated}
              onCancel={() => setShowAiPanel(false)}
            />
          )}

          {/* View mode */}
          {descMode === "view" && task.description && !showAiPanel && (
            <div
              onClick={() => setDescMode("edit")}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-text min-h-[80px]"
            >
              <MarkdownView content={task.description} />
            </div>
          )}

          {/* Edit mode */}
          {descMode === "edit" && (
            <div className="space-y-2">
              <textarea
                ref={descRef}
                value={descDraft}
                onChange={(e) => { setDescDraft(e.target.value); resizeDesc(); }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const val = descDraft.substring(0, start) + "  " + descDraft.substring(end);
                    setDescDraft(val);
                    setTimeout(() => { if (descRef.current) { descRef.current.selectionStart = descRef.current.selectionEnd = start + 2; } }, 0);
                  }
                }}
                placeholder={"Click 'Generate with AI' to auto-fill a User Story, Description, and Acceptance Criteria — or write your own below.\n\nMarkdown is supported: **bold**, _italic_, ## headings, - lists, - [ ] checkboxes"}
                className="w-full px-4 py-3 rounded-xl border-2 border-nexus-300 dark:border-nexus-700 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-nexus-500 transition-colors resize-none font-mono leading-relaxed"
                style={{ minHeight: "220px" }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  Markdown supported · Tab for indent · Shift+Enter for new line
                </p>
                <div className="flex items-center gap-2">
                  {task.description && (
                    <button
                      onClick={() => { setDescDraft(task.description ?? ""); setDescMode("view"); }}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Discard
                    </button>
                  )}
                  <button
                    onClick={saveDesc}
                    className="px-3 py-1.5 rounded-lg bg-nexus-500 hover:bg-nexus-600 text-white text-xs font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {descMode === "view" && !task.description && !showAiPanel && (
            <button
              onClick={() => setDescMode("edit")}
              className="w-full px-4 py-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 transition-colors text-left"
            >
              Click to add a description, or use <span className="text-nexus-500 font-semibold">✨ Generate with AI</span> to auto-fill a User Story, Description &amp; Acceptance Criteria.
            </button>
          )}
        </div>

        {/* ── Comments ── */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            <MessageSquare className="w-3 h-3" />
            Comments
            {task.comments.length > 0 && (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-bold text-gray-600 dark:text-gray-300">
                {task.comments.length}
              </span>
            )}
          </label>

          {task.comments.length === 0 && (
            <p className="text-xs text-gray-400 mb-3">No comments yet. Start the conversation.</p>
          )}

          <div className="space-y-3 mb-4">
            {task.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 group">
                <Avatar user={comment.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{comment.author.name ?? "Unknown"}</span>
                    <span className="text-[10px] text-gray-400">{fmtTime(comment.createdAt)}</span>
                    {comment.author.id === currentUserId && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2.5">
            <Avatar user={members.find((m) => m.id === currentUserId) ?? null} size="sm" />
            <div className="flex-1 flex gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                placeholder="Add a comment… (Enter to post, Shift+Enter for new line)"
                rows={1}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 transition-colors resize-none"
              />
              <button
                onClick={postComment}
                disabled={!commentText.trim() || postingComment}
                className="p-2 rounded-xl bg-nexus-500 text-white hover:bg-nexus-600 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1 pb-2">
          <div>Created by <span className="font-medium text-gray-500 dark:text-gray-400">{task.creator.name}</span> on {fmtDate(task.createdAt)}</div>
          <div>Last updated {fmtTime(task.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}

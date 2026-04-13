"use client";

import { useEffect, useState, useRef } from "react";
import {
  X, Trash2, User, Calendar, Flag, Layers, Loader2,
  MessageSquare, Send, CheckCircle2, Clock, XCircle,
  AlertCircle, ChevronDown,
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
  status: string; dueDate: string | null; columnId: string;
  tags: string[];
  assignee: Member | null;
  creator: { id: string; name: string | null; image: string | null };
  column: Col;
  project: { id: string; name: string; color: string; columns: Col[] };
  comments: Comment[];
  createdAt: string; updatedAt: string;
}

const PRIORITY_CONFIG = {
  LOW:    { label: "Low",    color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800",       dot: "bg-slate-400" },
  MEDIUM: { label: "Medium", color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30",      dot: "bg-blue-500" },
  HIGH:   { label: "High",   color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30",  dot: "bg-orange-500" },
  URGENT: { label: "Urgent", color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/30",        dot: "bg-red-500" },
};

function Avatar({ user, size = "sm" }: { user: { name: string | null; image: string | null } | null; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
  if (!user) return (
    <div className={cn(sz, "rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center")}>
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return formatDate(iso);
}

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

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        setTask(data);
        setTitleDraft(data.title);
        setDescDraft(data.description ?? "");
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length);
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus();
  }, [editingDesc]);

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
    if (!task || titleDraft.trim() === task.title || !titleDraft.trim()) {
      setTitleDraft(task?.title ?? "");
      return;
    }
    await patch("title", titleDraft.trim());
  };

  const saveDesc = async () => {
    setEditingDesc(false);
    if (!task || descDraft === (task.description ?? "")) return;
    await patch("description", descDraft || null);
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
    if (res.ok) {
      setTask((prev) => prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : prev);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (res.ok) { onDelete(taskId); onClose(); }
    setDeleting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-nexus-500" />
    </div>
  );

  if (!task) return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">Task not found.</div>
  );

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span style={{ color: task.project.color }} className="font-semibold">{task.project.name}</span>
          <span>/</span>
          <span>{task.column.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete task"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Title */}
        <div>
          {editingTitle ? (
            <textarea
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveTitle(); } if (e.key === "Escape") { setTitleDraft(task.title); setEditingTitle(false); } }}
              rows={2}
              className="w-full text-xl font-extrabold text-gray-900 dark:text-white bg-transparent border-2 border-nexus-400 rounded-xl px-3 py-2 focus:outline-none resize-none"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-xl font-extrabold text-gray-900 dark:text-white cursor-text hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-xl px-3 py-2 -mx-3 transition-colors leading-snug"
            >
              {task.title}
            </h2>
          )}
          <p className="text-xs text-gray-400 mt-1 px-3 -mx-3">
            Created by {task.creator.name} · {formatDate(task.createdAt)}
            {saving && <span className="ml-2 text-nexus-500 animate-pulse">Saving…</span>}
          </p>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Column / Status */}
          <div>
            <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <Layers className="w-3 h-3" /> Status
            </label>
            <div className="relative">
              <select
                value={task.columnId}
                onChange={(e) => { setTask((p) => p ? { ...p, columnId: e.target.value, column: task.project.columns.find(c => c.id === e.target.value) ?? p.column } : p); patch("columnId", e.target.value); }}
                className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
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
                onChange={(e) => { setTask((p) => p ? { ...p, priority: e.target.value as FullTask["priority"] } : p); patch("priority", e.target.value); }}
                className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
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
                className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 appearance-none cursor-pointer"
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

        {/* Priority badge row */}
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", priorityConfig.bg, priorityConfig.color)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dot)} />
            {priorityConfig.label} Priority
          </span>
          {task.dueDate && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              new Date(task.dueDate) < new Date()
                ? "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate) < new Date() ? "Overdue · " : "Due "}{formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</label>
          {editingDesc ? (
            <textarea
              ref={descRef}
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onBlur={saveDesc}
              onKeyDown={(e) => { if (e.key === "Escape") { setDescDraft(task.description ?? ""); setEditingDesc(false); } }}
              rows={5}
              placeholder="Add a description — context, acceptance criteria, links…"
              className="w-full px-4 py-3 rounded-xl border-2 border-nexus-400 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none transition-colors"
            />
          ) : (
            <div
              onClick={() => setEditingDesc(true)}
              className={cn(
                "px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-sm cursor-text min-h-[80px] hover:border-gray-300 dark:hover:border-gray-700 transition-colors",
                task.description ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"
              )}
            >
              {task.description || "Click to add a description — context, acceptance criteria, links…"}
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            <MessageSquare className="w-3 h-3" />
            Comments
            {task.comments.length > 0 && <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-bold text-gray-600 dark:text-gray-300">{task.comments.length}</span>}
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
                    <span className="text-[10px] text-gray-400">{formatTime(comment.createdAt)}</span>
                    {comment.author.id === currentUserId && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2.5">
            <Avatar user={members.find(m => m.id === currentUserId) ?? null} size="sm" />
            <div className="flex-1 flex gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                placeholder="Add a comment… (Enter to post)"
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

        {/* Meta footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 space-y-1">
          <div>Created by <span className="font-medium text-gray-600 dark:text-gray-400">{task.creator.name}</span> on {formatDate(task.createdAt)}</div>
          <div>Last updated {formatTime(task.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}

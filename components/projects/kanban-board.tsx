"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, GripVertical, User, Calendar, MessageSquare } from "lucide-react";
import { cn, generateInitials, formatRelativeTime } from "@/lib/utils";
import { ProjectSetupGuide } from "./project-setup-guide";
import { TaskDetailPanel } from "./task-detail-panel";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  order: number;
  dueDate: Date | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  _count: { comments: number };
}

interface Column {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  project: { id: string; name: string; color: string; description?: string | null };
  currentUserId: string;
  members: Member[];
  initialColumns?: Column[];
}

const PRIORITY_CONFIG = {
  LOW:    { color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800",       dot: "bg-slate-400" },
  MEDIUM: { color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30",      dot: "bg-blue-500" },
  HIGH:   { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30",  dot: "bg-orange-500" },
  URGENT: { color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/30",        dot: "bg-red-500" },
};

export function KanbanBoard({ project, initialColumns = [], currentUserId, members }: KanbanBoardProps) {
  const totalTasks = initialColumns.reduce((sum, col) => sum + col.tasks.length, 0);
  const [showSetupGuide, setShowSetupGuide] = useState(totalTasks === 0);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (task: Task, fromColumnId: string) => {
    setDraggedTask({ task, fromColumnId });
  };

  const handleDrop = async (toColumnId: string) => {
    if (!draggedTask) return;
    const { task, fromColumnId } = draggedTask;
    if (fromColumnId === toColumnId) { setDraggedTask(null); setDragOverColumn(null); return; }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromColumnId) return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        if (col.id === toColumnId) return { ...col, tasks: [...col.tasks, { ...task }] };
        return col;
      })
    );
    setDraggedTask(null);
    setDragOverColumn(null);

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: toColumnId }),
    }).catch(console.error);
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId, title: newTaskTitle.trim(), description: null,
      priority: "MEDIUM", status: "TODO", order: 999,
      dueDate: null, assignee: null, _count: { comments: 0 },
    };

    setColumns((prev) => prev.map((col) => col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col));
    setNewTaskTitle("");
    setAddingToColumn(null);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, columnId, title: newTask.title }),
    }).catch(console.error);

    if (res) {
      const saved = await res.json();
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.map((t) => (t.id === tempId ? { ...t, id: saved.id } : t)) }
            : col
        )
      );
    }
  };

  // Called from TaskDetailPanel when a field is saved
  const handleTaskUpdate = (taskId: string, changes: Record<string, unknown>, newColumnId?: string) => {
    setColumns((prev) => {
      if (newColumnId) {
        // Move task to new column
        let movedTask: Task | null = null;
        const updated = prev.map((col) => {
          const task = col.tasks.find((t) => t.id === taskId);
          if (task) { movedTask = task; return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }; }
          return col;
        });
        if (movedTask) {
          return updated.map((col) =>
            col.id === newColumnId ? { ...col, tasks: [...col.tasks, { ...movedTask!, ...changes }] } : col
          );
        }
        return updated;
      }
      return prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => t.id === taskId ? { ...t, ...changes } : t),
      }));
    });
  };

  const handleTaskDelete = (taskId: string) => {
    setColumns((prev) =>
      prev.map((col) => ({ ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }))
    );
    setSelectedTaskId(null);
  };

  if (showSetupGuide) {
    return (
      <ProjectSetupGuide
        project={project}
        firstColumn={columns[0]}
        allColumns={columns}
        members={members}
        onComplete={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Board */}
      <div className={cn("flex-1 overflow-x-auto pb-4 scrollbar-thin transition-all", selectedTaskId && "lg:mr-[480px]")}>
        <div className="flex gap-4 min-w-max pb-2">
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn(
                "kanban-column",
                dragOverColumn === column.id && "ring-2 ring-nexus-400 dark:ring-nexus-600"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.id); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{column.name}</span>
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-2.5">
                {column.tasks.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.MEDIUM;
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        "task-card group cursor-pointer",
                        isSelected && "ring-2 ring-nexus-400 dark:ring-nexus-600"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: priority.dot.replace("bg-", "") }} />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug flex-1">{task.title}</p>
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab mt-0.5" />
                      </div>

                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", priority.bg, priority.color)}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {task.assignee ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
                            {task.assignee.image
                              ? <img src={task.assignee.image} alt="" className="w-full h-full object-cover" />
                              : generateInitials(task.assignee.name ?? "U")}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-400">
                          {task.dueDate && (
                            <span className={cn("flex items-center gap-0.5 text-[10px]", new Date(task.dueDate) < new Date() ? "text-red-500" : "")}>
                              <Calendar className="w-3 h-3" />
                              {formatRelativeTime(task.dueDate)}
                            </span>
                          )}
                          {task._count.comments > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px]">
                              <MessageSquare className="w-3 h-3" />
                              {task._count.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add task */}
                {addingToColumn === column.id ? (
                  <div className="bg-white dark:bg-[#0d0d21] rounded-xl border-2 border-nexus-400 p-3">
                    <textarea
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddTask(column.id); }
                        if (e.key === "Escape") { setAddingToColumn(null); setNewTaskTitle(""); }
                      }}
                      placeholder="Task title…"
                      rows={2}
                      className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => handleAddTask(column.id)} className="px-3 py-1.5 rounded-lg bg-nexus-500 text-white text-xs font-semibold hover:bg-nexus-600 transition-colors">Add</button>
                      <button onClick={() => { setAddingToColumn(null); setNewTaskTitle(""); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToColumn(column.id)}
                    className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 text-xs font-medium transition-all group"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:text-nexus-500 transition-colors" />
                    Add task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white dark:bg-[#0d0d21] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-40 flex flex-col">
          <TaskDetailPanel
            taskId={selectedTaskId}
            members={members}
            currentUserId={currentUserId}
            onClose={() => setSelectedTaskId(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        </div>
      )}
    </div>
  );
}

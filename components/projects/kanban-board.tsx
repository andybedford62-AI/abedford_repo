"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, GripVertical, User, Calendar, MessageSquare, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn, generateInitials, formatRelativeTime } from "@/lib/utils";
import { ProjectSetupGuide } from "./project-setup-guide";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialColumns?: any[];
}

export function KanbanBoard({ project, initialColumns = [], currentUserId, members }: KanbanBoardProps & { initialColumns?: Column[] }) {
  const totalTasks = initialColumns.reduce((sum, col) => sum + col.tasks.length, 0);
  const [showSetupGuide, setShowSetupGuide] = useState(totalTasks === 0);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const priorityConfig = {
    LOW: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", dot: "bg-slate-400" },
    MEDIUM: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", dot: "bg-blue-500" },
    HIGH: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", dot: "bg-orange-500" },
    URGENT: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", dot: "bg-red-500" },
  };

  const handleDragStart = (task: Task, fromColumnId: string) => {
    setDraggedTask({ task, fromColumnId });
  };

  const handleDrop = async (toColumnId: string) => {
    if (!draggedTask) return;
    const { task, fromColumnId } = draggedTask;
    if (fromColumnId === toColumnId) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }

    // Optimistic UI update
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromColumnId) return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        if (col.id === toColumnId) return { ...col, tasks: [...col.tasks, { ...task, columnId: toColumnId }] };
        return col;
      })
    );

    setDraggedTask(null);
    setDragOverColumn(null);

    // Persist to server
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: toColumnId }),
      });
    } catch (err) {
      console.error("Failed to update task column", err);
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle.trim(),
      description: null,
      priority: "MEDIUM",
      status: "TODO",
      order: 999,
      dueDate: null,
      assignee: null,
      _count: { comments: 0 },
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );
    setNewTaskTitle("");
    setAddingToColumn(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, columnId, title: newTask.title }),
      });
      const saved = await res.json();
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.map((t) => (t.id === tempId ? { ...t, id: saved.id } : t)) }
            : col
        )
      );
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  if (showSetupGuide) {
    return (
      <ProjectSetupGuide
        project={project}
        firstColumn={columns[0]}
        allColumns={columns}
        members={members}
        onComplete={() => {
          // Re-fetch columns with new tasks by reloading the page
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin">
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
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  {column.name}
                </span>
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
                const priority = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.MEDIUM;
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    onClick={() => setSelectedTask(task)}
                    className="task-card group"
                  >
                    {/* Priority indicator */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`priority-dot ${task.priority} mt-1.5`} style={{ backgroundColor: priority.dot.replace("bg-", "") }} />
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug flex-1">
                        {task.title}
                      </p>
                      <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab mt-0.5" />
                    </div>

                    {/* Tags / priority */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", priority.bg, priority.color)}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {task.assignee ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
                          {task.assignee.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={task.assignee.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            generateInitials(task.assignee.name ?? "U")
                          )}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-400">
                        {task.dueDate && (
                          <span className={cn(
                            "flex items-center gap-0.5 text-[10px]",
                            new Date(task.dueDate) < new Date() ? "text-red-500" : ""
                          )}>
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
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddTask(column.id);
                      }
                      if (e.key === "Escape") {
                        setAddingToColumn(null);
                        setNewTaskTitle("");
                      }
                    }}
                    placeholder="Task title..."
                    rows={2}
                    className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="px-3 py-1.5 rounded-lg bg-nexus-500 text-white text-xs font-semibold hover:bg-nexus-600 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingToColumn(null); setNewTaskTitle(""); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
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

      {/* Task Detail Modal (simplified) */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-white dark:bg-[#0d0d21] border-l border-gray-200 dark:border-gray-800 overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedTask.status === "DONE" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : selectedTask.status === "IN_PROGRESS" ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : selectedTask.status === "CANCELLED" ? (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">{selectedTask.status.replace("_", " ")}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            {selectedTask.description && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTask.description}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Priority</span>
                  <div className="mt-1">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-semibold",
                      priorityConfig[selectedTask.priority as keyof typeof priorityConfig]?.bg,
                      priorityConfig[selectedTask.priority as keyof typeof priorityConfig]?.color
                    )}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Assignee</span>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedTask.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold">
                          {generateInitials(selectedTask.assignee.name ?? "U")}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedTask.assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>

                {selectedTask.dueDate && (
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Due Date</span>
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(selectedTask.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

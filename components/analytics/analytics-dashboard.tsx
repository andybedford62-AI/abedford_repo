"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, CheckCircle2, Clock, AlertCircle, Users,
  BarChart3, Activity, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  taskStats: { status: string; count: number }[];
  projectStats: { name: string; color: string; total: number; done: number }[];
  memberCount: number;
  activityCount: number;
  completedTasksByDay: { date: string; tasks: number }[];
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#f59e0b",
  DONE: "#10b981",
  CANCELLED: "#6b7280",
};

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const completionRate = data.totalTasks > 0
    ? Math.round((data.doneTasks / data.totalTasks) * 100)
    : 0;

  const pieData = data.taskStats.map((s) => ({
    name: s.status.replace("_", " "),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  const statsCards = [
    {
      label: "Total Tasks",
      value: data.totalTasks,
      icon: BarChart3,
      gradient: "from-nexus-500 to-violet-600",
      bg: "bg-nexus-50 dark:bg-nexus-950/30",
    },
    {
      label: "Completed",
      value: data.doneTasks,
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "In Progress",
      value: data.inProgressTasks,
      icon: Clock,
      gradient: "from-blue-500 to-cyan-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Team Members",
      value: data.memberCount,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "Activities",
      value: data.activityCount,
      icon: Activity,
      gradient: "from-pink-500 to-rose-600",
      bg: "bg-pink-50 dark:bg-pink-950/30",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Workspace insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nexus-50 dark:bg-nexus-950/30 border border-nexus-200 dark:border-nexus-800 text-nexus-700 dark:text-nexus-300 text-xs font-medium">
          <Zap className="w-3.5 h-3.5" />
          Live data
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statsCards.map(({ label, value, icon: Icon, gradient, bg }) => (
          <div key={label} className="stat-card">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
              <div className={`bg-gradient-to-br ${gradient} [-webkit-background-clip:text] bg-clip-text`}>
                <Icon className="w-4 h-4" style={{ color: "transparent", backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tasks completed by day */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Tasks Completed</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.completedTasksByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="tasks" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6272f5" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task distribution */}
        <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1">Task Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">By status</p>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                  formatter={(value: number) => [value, "tasks"]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              No tasks yet
            </div>
          )}

          <div className="space-y-2 mt-3">
            {pieData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{name}</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project progress */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white">Project Progress</h2>
          <p className="text-xs text-gray-400 mt-0.5">Completion rate per project</p>
        </div>

        {data.projectStats.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No projects to display</div>
        ) : (
          <div className="space-y-4">
            {data.projectStats.map((project) => {
              const progress = project.total > 0 ? Math.round((project.done / project.total) * 100) : 0;
              return (
                <div key={project.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{project.done}/{project.total} tasks</span>
                      <span className="font-bold text-gray-600 dark:text-gray-300">{progress}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

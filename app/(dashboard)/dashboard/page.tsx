import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Clock, AlertCircle, TrendingUp, Zap, Bot,
  FolderKanban, ArrowRight, Users, MessageSquare, Calendar
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const membership = await db.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          projects: {
            take: 5,
            orderBy: { updatedAt: "desc" },
            include: { _count: { select: { tasks: true } } },
          },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) return null;

  const workspace = membership.workspace;

  const [taskStats, recentTasks, recentActivity] = await Promise.all([
    db.task.groupBy({
      by: ["status"],
      where: { project: { workspaceId: workspace.id } },
      _count: true,
    }),
    db.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: "DONE" },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { project: { select: { name: true, color: true } } },
    }),
    db.activityLog.findMany({
      where: { workspaceId: workspace.id },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, image: true } } },
    }),
  ]);

  const stats = {
    done: taskStats.find((s) => s.status === "DONE")?._count ?? 0,
    inProgress: taskStats.find((s) => s.status === "IN_PROGRESS")?._count ?? 0,
    todo: taskStats.find((s) => s.status === "TODO")?._count ?? 0,
    total: taskStats.reduce((acc, s) => acc + s._count, 0),
  };

  return { workspace, stats, recentTasks, recentActivity };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/onboarding");

  const { workspace, stats, recentTasks } = data;
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const userName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Good morning, {userName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {workspace.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Tasks Done",
            value: stats.done,
            icon: CheckCircle2,
            color: "from-green-500 to-emerald-600",
            bg: "bg-green-50 dark:bg-green-950/30",
            change: "+12% this week",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: Clock,
            color: "from-blue-500 to-nexus-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            change: `${stats.todo} in backlog`,
          },
          {
            label: "Team Members",
            value: workspace._count.members,
            icon: Users,
            color: "from-violet-500 to-purple-600",
            bg: "bg-violet-50 dark:bg-violet-950/30",
            change: "Active workspace",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "from-amber-500 to-orange-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            change: "All time",
          },
        ].map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <div className={`bg-gradient-to-br ${color} bg-clip-text`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-br ${color} text-transparent`} style={{ WebkitTextStroke: "0px" }} />
                </div>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5">{value}</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-[11px] text-gray-400 mt-1">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">My Tasks</h2>
              <p className="text-xs text-gray-400 mt-0.5">Assigned to you · {stats.inProgress + stats.todo} remaining</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-medium text-nexus-600 dark:text-nexus-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentTasks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending tasks assigned to you.</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span>{task.project.name}</span>
                      {task.dueDate && (
                        <>
                          <span>·</span>
                          <Calendar className="w-3 h-3" />
                          <span className={new Date(task.dueDate) < new Date() ? "text-red-500" : ""}>
                            Due {formatRelativeTime(task.dueDate)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    task.priority === "URGENT" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                    task.priority === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" :
                    task.priority === "MEDIUM" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* AI Quick Access */}
          <div className="bg-gradient-to-br from-nexus-600 via-violet-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5" />
                <span className="font-bold">AI Assistant</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase">Claude</span>
              </div>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Ask anything — summarize tasks, write code, analyze data, or get suggestions.
              </p>
              <Link
                href="/ai"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-nexus-700 text-sm font-semibold hover:bg-white/90 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Ask Claude AI
              </Link>
            </div>
          </div>

          {/* Projects quick list */}
          <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Projects</h2>
              <Link href="/projects" className="text-[11px] text-nexus-600 dark:text-nexus-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {workspace.projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{project.name}</span>
                  <span className="text-[11px] text-gray-400">{project._count.tasks} tasks</span>
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/projects/new"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs font-medium hover:border-nexus-400 hover:text-nexus-500 transition-all"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                New project
              </Link>
            </div>
          </div>

          {/* Channels */}
          <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-nexus-500" />
                Channels
              </h2>
              <Link href="/chat" className="text-[11px] text-nexus-600 dark:text-nexus-400 hover:underline">
                Open chat
              </Link>
            </div>
            {["general", "engineering", "design", "random"].map((channel) => (
              <Link
                key={channel}
                href={`/chat/${channel}`}
                className="flex items-center gap-2.5 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
              >
                <div className="w-6 h-6 rounded-md bg-nexus-100 dark:bg-nexus-950/50 flex items-center justify-center text-nexus-600 dark:text-nexus-400 text-[10px] font-bold">#</div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{channel}</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

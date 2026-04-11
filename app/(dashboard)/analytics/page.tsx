import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) redirect("/onboarding");

  const workspaceId = membership.workspaceId;

  const [taskStats, projectStats, memberStats, recentActivity] = await Promise.all([
    // Task stats by status
    db.task.groupBy({
      by: ["status"],
      where: { project: { workspaceId } },
      _count: true,
    }),
    // Projects
    db.project.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true, createdAt: true } },
      },
    }),
    // Member count
    db.workspaceMember.count({ where: { workspaceId } }),
    // Recent activity
    db.activityLog.count({ where: { workspaceId } }),
  ]);

  // Tasks completed per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const completedTasksByDay = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const count = await db.task.count({
        where: {
          project: { workspaceId },
          status: "DONE",
          updatedAt: { gte: start, lte: end },
        },
      });

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        tasks: count,
      };
    })
  );

  const serialized = {
    taskStats: taskStats.map((s) => ({ status: s.status, count: s._count })),
    projectStats: projectStats.map((p) => ({
      name: p.name,
      color: p.color,
      total: p._count.tasks,
      done: p.tasks.filter((t) => t.status === "DONE").length,
    })),
    memberCount: memberStats,
    activityCount: recentActivity,
    completedTasksByDay,
    totalTasks: taskStats.reduce((acc, s) => acc + s._count, 0),
    doneTasks: taskStats.find((s) => s.status === "DONE")?._count ?? 0,
    inProgressTasks: taskStats.find((s) => s.status === "IN_PROGRESS")?._count ?? 0,
  };

  return <AnalyticsDashboard data={serialized} />;
}

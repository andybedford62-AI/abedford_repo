import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Plus, Clock, CheckCircle2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) redirect("/onboarding");

  const projects = await db.project.findMany({
    where: { workspaceId: membership.workspaceId },
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        select: { status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in {membership.workspace.name}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-nexus-500/25"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-nexus-100 dark:bg-nexus-950/50 flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-nexus-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Create your first project and start managing tasks.</p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const done = project.tasks.filter((t) => t.status === "DONE").length;
            const total = project.tasks.length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-nexus-300 dark:hover:border-nexus-700 hover:shadow-lg hover:shadow-nexus-500/5 transition-all hover:-translate-y-0.5"
              >
                {/* Project color accent */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: project.color + "20", borderColor: project.color + "40" }}
                    >
                      <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-nexus-600 dark:group-hover:text-nexus-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        project.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400" :
                        project.status === "PAUSED" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                        project.status === "COMPLETED" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {done}/{total} done
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    {inProgress} active
                  </span>
                  {project.dueDate && (
                    <span className={`ml-auto flex items-center gap-1 ${new Date(project.dueDate) < new Date() ? "text-red-500" : ""}`}>
                      Due {formatDate(project.dueDate)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* New project card */}
          <Link
            href="/projects/new"
            className="flex flex-col items-center justify-center bg-white dark:bg-[#0d0d21] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 hover:border-nexus-400 dark:hover:border-nexus-600 transition-all text-gray-400 hover:text-nexus-500 group min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">New Project</span>
          </Link>
        </div>
      )}
    </div>
  );
}

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { KanbanBoard } from "@/components/projects/kanban-board";
import { ProjectHeader } from "@/components/projects/project-header";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              assignee: { select: { id: true, name: true, image: true } },
              creator: { select: { id: true, name: true } },
              _count: { select: { comments: true } },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      workspace: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true, email: true } } },
          },
        },
      },
    },
  });

  if (!project) notFound();

  // Verify access
  const isMember = project.workspace.members.some((m) => m.userId === session.user!.id);
  if (!isMember) redirect("/dashboard");

  return (
    <div className="flex flex-col h-full page-enter">
      <ProjectHeader project={project} />
      <KanbanBoard
        project={project}
        currentUserId={session.user.id}
        members={project.workspace.members.map((m) => m.user)}
      />
    </div>
  );
}

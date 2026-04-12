import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workspaces = await db.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, projects: true } },
    },
  });

  return NextResponse.json(workspaces);
}

export async function DELETE(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("id");
  if (!workspaceId) return NextResponse.json({ error: "Missing workspace ID" }, { status: 400 });

  // Delete in dependency order
  await db.$transaction(async (tx) => {
    // Tasks first (belong to projects)
    const projects = await tx.project.findMany({ where: { workspaceId }, select: { id: true } });
    const projectIds = projects.map((p) => p.id);
    await tx.task.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.project.deleteMany({ where: { workspaceId } });

    // Messages (belong to channels)
    const channels = await tx.channel.findMany({ where: { workspaceId }, select: { id: true } });
    const channelIds = channels.map((c) => c.id);
    await tx.message.deleteMany({ where: { channelId: { in: channelIds } } });
    await tx.channel.deleteMany({ where: { workspaceId } });

    // Other workspace data
    await tx.workspaceInvite.deleteMany({ where: { workspaceId } });
    await tx.activityLog.deleteMany({ where: { workspaceId } });
    await tx.workspaceMember.deleteMany({ where: { workspaceId } });
    await tx.workspace.delete({ where: { id: workspaceId } });
  });

  return NextResponse.json({ success: true });
}

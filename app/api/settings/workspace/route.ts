import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  return NextResponse.json({
    name: membership.workspace.name,
    slug: membership.workspace.slug,
    description: membership.workspace.description,
    plan: membership.workspace.plan,
  });
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await db.workspace.update({
    where: { id: membership.workspaceId },
    data: parsed.data,
  });

  return NextResponse.json({ name: updated.name, description: updated.description });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
  });

  if (!membership) return NextResponse.json({ error: "Only workspace owners can delete" }, { status: 403 });

  const workspaceId = membership.workspaceId;

  await db.$transaction(async (tx) => {
    const projects = await tx.project.findMany({ where: { workspaceId }, select: { id: true } });
    const projectIds = projects.map((p) => p.id);
    await tx.task.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.project.deleteMany({ where: { workspaceId } });

    const channels = await tx.channel.findMany({ where: { workspaceId }, select: { id: true } });
    const channelIds = channels.map((c) => c.id);
    await tx.message.deleteMany({ where: { channelId: { in: channelIds } } });
    await tx.channel.deleteMany({ where: { workspaceId } });

    await tx.workspaceInvite.deleteMany({ where: { workspaceId } });
    await tx.activityLog.deleteMany({ where: { workspaceId } });
    await tx.workspaceMember.deleteMany({ where: { workspaceId } });
    await tx.workspace.delete({ where: { id: workspaceId } });
  });

  return NextResponse.json({ success: true });
}


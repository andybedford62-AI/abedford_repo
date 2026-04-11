import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  dueDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const membership = await db.workspaceMember.findFirst({
      where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN", "MEMBER"] } },
      include: { workspace: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const { name, description, color, dueDate } = parsed.data;

    const project = await db.project.create({
      data: {
        workspaceId: membership.workspaceId,
        name,
        description,
        color: color ?? "#6272f5",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    // Create default Kanban columns
    await db.column.createMany({
      data: [
        { projectId: project.id, name: "To Do", order: 0, color: "#64748b" },
        { projectId: project.id, name: "In Progress", order: 1, color: "#3b82f6" },
        { projectId: project.id, name: "In Review", order: 2, color: "#f59e0b" },
        { projectId: project.id, name: "Done", order: 3, color: "#10b981" },
      ],
    });

    // Log activity
    await db.activityLog.create({
      data: {
        workspaceId: membership.workspaceId,
        userId: session.user.id,
        action: "project.created",
        entityType: "project",
        entityId: project.id,
        metadata: { projectName: name },
      },
    }).catch(() => {});

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[CREATE_PROJECT]", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return NextResponse.json([]);
  }

  const projects = await db.project.findMany({
    where: { workspaceId: membership.workspaceId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const columnSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  dueDate: z.string().optional(),
  columns: z.array(columnSchema).min(1).max(10).optional(),
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

    const { name, description, color, dueDate, columns } = parsed.data;

    const project = await db.project.create({
      data: {
        workspaceId: membership.workspaceId,
        name,
        description,
        color: color ?? "#6272f5",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    const defaultColumns = [
      { name: "To Do", color: "#64748b" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "In Review", color: "#f59e0b" },
      { name: "Done", color: "#10b981" },
    ];

    const cols = columns ?? defaultColumns;
    await db.column.createMany({
      data: cols.map((col, i) => ({ projectId: project.id, name: col.name, order: i, color: col.color })),
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

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createTaskSchema = z.object({
  projectId: z.string(),
  columnId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { projectId, columnId, title, description, priority, assigneeId, dueDate } = parsed.data;

    // Verify project access
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    // Get max order in column
    const maxOrder = await db.task.aggregate({
      where: { columnId },
      _max: { order: true },
    });

    const task = await db.task.create({
      data: {
        projectId,
        columnId,
        creatorId: session.user.id,
        title,
        description,
        priority: priority ?? "MEDIUM",
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        workspaceId: project.workspaceId,
        userId: session.user.id,
        action: "task.created",
        entityType: "task",
        entityId: task.id,
        metadata: { taskTitle: title, projectName: project.name },
      },
    }).catch(() => {}); // non-critical

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("[CREATE_TASK]", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

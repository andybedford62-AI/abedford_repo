import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  assigneeId: z.string().nullable().optional(),
  columnId: z.string().optional(),
  order: z.number().optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify access
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        project: { workspace: { members: { some: { userId: session.user.id } } } },
      },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { dueDate, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (parsed.data.status === "DONE" && task.status !== "DONE") {
      updateData.completedAt = new Date();
    }

    const updated = await db.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[UPDATE_TASK]", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        project: { workspace: { members: { some: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } } } } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found or insufficient permissions" }, { status: 404 });
    }

    await db.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_TASK]", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

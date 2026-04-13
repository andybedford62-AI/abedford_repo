import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = z.object({ content: z.string().min(1).max(5000) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const task = await db.task.findFirst({
    where: {
      id: params.id,
      project: { workspace: { members: { some: { userId: session.user.id } } } },
    },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comment = await db.taskComment.create({
    data: { taskId: params.id, authorId: session.user.id, content: parsed.data.content },
  });

  const author = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, image: true },
  });

  return NextResponse.json({ ...comment, author }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await req.json();
  if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 });

  const comment = await db.taskComment.findFirst({
    where: { id: commentId, taskId: params.id, authorId: session.user.id },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.taskComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}

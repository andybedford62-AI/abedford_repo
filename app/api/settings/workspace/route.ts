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

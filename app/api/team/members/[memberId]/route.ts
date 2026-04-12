import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

async function getAdminMembership(userId: string) {
  return db.workspaceMember.findFirst({
    where: { userId, role: { in: ["OWNER", "ADMIN"] } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await getAdminMembership(session.user.id);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = z.object({ role: z.enum(["MEMBER", "ADMIN", "VIEWER"]) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const target = await db.workspaceMember.findFirst({
    where: { id: params.memberId, workspaceId: admin.workspaceId },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "OWNER") return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });

  const updated = await db.workspaceMember.update({
    where: { id: params.memberId },
    data: { role: parsed.data.role },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await getAdminMembership(session.user.id);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await db.workspaceMember.findFirst({
    where: { id: params.memberId, workspaceId: admin.workspaceId },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "OWNER") return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });
  if (target.userId === session.user.id) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });

  await db.workspaceMember.delete({ where: { id: params.memberId } });
  return NextResponse.json({ success: true });
}

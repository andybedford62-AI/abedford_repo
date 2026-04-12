import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const originalRole = (session?.user as { originalAdminId?: string })?.originalAdminId ? "SUPER_ADMIN" : role;
  if (!session || (role !== "SUPER_ADMIN" && originalRole !== "SUPER_ADMIN")) return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { workspaceMembers: true, aiConversations: true } },
    },
  });

  return NextResponse.json(users);
}

export async function DELETE(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  // Prevent deleting yourself
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  // Delete user's workspace memberships, then the user
  await db.workspaceMember.deleteMany({ where: { userId } });
  await db.aiConversation.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}

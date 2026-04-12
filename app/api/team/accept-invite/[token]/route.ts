import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const invite = await db.workspaceInvite.findUnique({
    where: { token: params.token },
    include: { workspace: true },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found or already used" }, { status: 404 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "This invite has expired" }, { status: 410 });

  return NextResponse.json({
    workspaceName: invite.workspace.name,
    email: invite.email,
    role: invite.role,
  });
}

// Called after login/register to consume invite and join workspace
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await db.workspaceInvite.findUnique({
    where: { token: params.token },
    include: { workspace: true },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 410 });

  // Check not already a member
  const existing = await db.workspaceMember.findFirst({
    where: { workspaceId: invite.workspaceId, userId: session.user.id },
  });

  if (!existing) {
    await db.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
        role: invite.role,
      },
    });
  }

  // Delete invite after use
  await db.workspaceInvite.delete({ where: { token: params.token } });

  return NextResponse.json({ workspaceName: invite.workspace.name, success: true });
}

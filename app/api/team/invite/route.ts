import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendInviteEmail, sendAddedToWorkspaceEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "ADMIN", "VIEWER"]).default("MEMBER"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { email, role } = parsed.data;

  // Get admin's workspace
  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { workspace: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { workspace } = membership;
  const inviterName = session.user.name ?? session.user.email ?? "A teammate";

  // Check if already a member
  const existingMember = await db.workspaceMember.findFirst({
    where: { workspaceId: workspace.id, user: { email } },
  });
  if (existingMember) {
    return NextResponse.json({ error: "This person is already a member" }, { status: 400 });
  }

  // Flow A: User already has an account — add directly
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    await db.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: existingUser.id,
        role: role as "MEMBER" | "ADMIN" | "VIEWER",
      },
    });
    try {
      await sendAddedToWorkspaceEmail({
        to: email,
        workspaceName: workspace.name,
        inviterName,
        role,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
    return NextResponse.json({ type: "added", message: `${email} has been added to the workspace.` });
  }

  // Flow B: New user — create invite + send email
  // Remove any existing invite for this email
  await db.workspaceInvite.deleteMany({ where: { workspaceId: workspace.id, email } });

  const invite = await db.workspaceInvite.create({
    data: {
      workspaceId: workspace.id,
      email,
      role: role as "MEMBER" | "ADMIN" | "VIEWER",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  try {
    await sendInviteEmail({
      to: email,
      workspaceName: workspace.name,
      inviterName,
      token: invite.token,
      role,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  return NextResponse.json({ type: "invited", message: `Invite sent to ${email}.` });
}

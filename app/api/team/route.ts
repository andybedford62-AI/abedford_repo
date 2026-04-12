import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          members: {
            include: { user: true },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

  const { workspace } = membership;

  return NextResponse.json({
    id: workspace.id,
    name: workspace.name,
    myRole: membership.role,
    members: workspace.members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      userId: m.userId,
      user: {
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
      },
    })),
  });
}

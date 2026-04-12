import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, totalWorkspaces, totalProjects, paidWorkspaces] = await Promise.all([
    db.user.count(),
    db.workspace.count(),
    db.project.count(),
    db.workspace.count({ where: { plan: { not: "FREE" } } }),
  ]);

  return NextResponse.json({ totalUsers, totalWorkspaces, totalProjects, paidWorkspaces });
}

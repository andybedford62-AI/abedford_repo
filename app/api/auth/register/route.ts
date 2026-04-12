import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  workspaceName: z.string().min(2).max(100).optional(),
  inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Please check your details." },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName, inviteToken } = parsed.data;

    // Validate invite token if provided
    let invite = null;
    if (inviteToken) {
      invite = await db.workspaceInvite.findUnique({
        where: { token: inviteToken },
        include: { workspace: true },
      });
      if (!invite) {
        return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 400 });
      }
      if (invite.expiresAt < new Date()) {
        return NextResponse.json({ error: "This invite link has expired." }, { status: 400 });
      }
    } else if (!workspaceName) {
      return NextResponse.json(
        { error: "Workspace name is required." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    if (invite) {
      // Invite flow: join the invited workspace
      const alreadyMember = await db.workspaceMember.findFirst({
        where: { workspaceId: invite.workspaceId, userId: user.id },
      });
      if (!alreadyMember) {
        await db.workspaceMember.create({
          data: { workspaceId: invite.workspaceId, userId: user.id, role: invite.role },
        });
      }
      await db.workspaceInvite.delete({ where: { token: inviteToken } });
    } else {
      // Normal flow: create new workspace
      let slug = slugify(workspaceName!);
      const existing = await db.workspace.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      const workspace = await db.workspace.create({
        data: {
          name: workspaceName!,
          slug,
          members: {
            create: { userId: user.id, role: "OWNER" },
          },
        },
      });

      // Create default channels
      await db.channel.createMany({
        data: [
          { workspaceId: workspace.id, name: "general", description: "General discussions", type: "PUBLIC" },
          { workspaceId: workspace.id, name: "random", description: "Off-topic chats", type: "PUBLIC" },
        ],
      });

      // Create onboarding project
      const project = await db.project.create({
        data: {
          workspaceId: workspace.id,
          name: "Getting Started",
          description: "Your first project — explore NexusAI!",
          color: "#6272f5",
        },
      });

      // Create default columns
      const columns = await Promise.all([
        db.column.create({ data: { projectId: project.id, name: "To Do", order: 0, color: "#64748b" } }),
        db.column.create({ data: { projectId: project.id, name: "In Progress", order: 1, color: "#3b82f6" } }),
        db.column.create({ data: { projectId: project.id, name: "Done", order: 2, color: "#10b981" } }),
      ]);

      // Create welcome task
      await db.task.create({
        data: {
          projectId: project.id,
          columnId: columns[0].id,
          creatorId: user.id,
          assigneeId: user.id,
          title: "Welcome to NexusAI! 👋",
          description: "Drag this card to 'Done' when you've explored the workspace. Try the AI assistant, create a project, and invite your team!",
          priority: "HIGH",
          order: 0,
        },
      });
    }

    return NextResponse.json(
      { message: "Account created successfully!", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

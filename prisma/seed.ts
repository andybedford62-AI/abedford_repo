import { PrismaClient, Plan, WorkspaceRole, Priority, TaskStatus, ProjectStatus, ChannelType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NexusAI database...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("demo123!", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@nexusai.demo" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@nexusai.demo",
      password: hashedPassword,
      image: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@nexusai.demo" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "bob@nexusai.demo",
      password: hashedPassword,
      image: "https://avatars.githubusercontent.com/u/2?v=4",
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@nexusai.demo" },
    update: {},
    create: {
      name: "Carol Davis",
      email: "carol@nexusai.demo",
      password: hashedPassword,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
      description: "Building the future, one sprint at a time.",
      plan: Plan.PRO,
    },
  });

  // Add members
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: alice.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: alice.id, role: WorkspaceRole.OWNER },
  });
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: bob.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: bob.id, role: WorkspaceRole.ADMIN },
  });
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: carol.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: carol.id, role: WorkspaceRole.MEMBER },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: "Website Redesign",
      description: "Complete overhaul of the marketing website with new brand guidelines",
      color: "#6272f5",
      status: ProjectStatus.ACTIVE,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create columns
  const col1 = await prisma.column.create({ data: { projectId: project.id, name: "Backlog", order: 0, color: "#64748b" } });
  const col2 = await prisma.column.create({ data: { projectId: project.id, name: "In Progress", order: 1, color: "#3b82f6" } });
  const col3 = await prisma.column.create({ data: { projectId: project.id, name: "In Review", order: 2, color: "#f59e0b" } });
  const col4 = await prisma.column.create({ data: { projectId: project.id, name: "Done", order: 3, color: "#10b981" } });

  // Create tasks
  const tasks = [
    { title: "Design new hero section", columnId: col4.id, assigneeId: alice.id, priority: Priority.HIGH, status: TaskStatus.DONE },
    { title: "Update brand color system", columnId: col3.id, assigneeId: bob.id, priority: Priority.MEDIUM, status: TaskStatus.IN_REVIEW },
    { title: "Rebuild navigation component", columnId: col2.id, assigneeId: carol.id, priority: Priority.HIGH, status: TaskStatus.IN_PROGRESS },
    { title: "Write copy for About page", columnId: col2.id, assigneeId: alice.id, priority: Priority.LOW, status: TaskStatus.IN_PROGRESS },
    { title: "Implement dark mode toggle", columnId: col1.id, assigneeId: bob.id, priority: Priority.MEDIUM, status: TaskStatus.TODO },
    { title: "Performance optimization audit", columnId: col1.id, assigneeId: null, priority: Priority.URGENT, status: TaskStatus.TODO },
    { title: "Mobile responsive breakpoints", columnId: col1.id, assigneeId: carol.id, priority: Priority.HIGH, status: TaskStatus.TODO },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await prisma.task.create({
      data: { ...tasks[i], projectId: project.id, creatorId: alice.id, order: i },
    });
  }

  // Create channels
  await prisma.channel.createMany({
    data: [
      { workspaceId: workspace.id, name: "general", description: "Company-wide announcements", type: ChannelType.PUBLIC },
      { workspaceId: workspace.id, name: "engineering", description: "Engineering team discussions", type: ChannelType.PUBLIC },
      { workspaceId: workspace.id, name: "design", description: "Design feedback and assets", type: ChannelType.PUBLIC },
      { workspaceId: workspace.id, name: "random", description: "Off-topic conversations", type: ChannelType.PUBLIC },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Demo credentials:");
  console.log("   Email: alice@nexusai.demo");
  console.log("   Password: demo123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

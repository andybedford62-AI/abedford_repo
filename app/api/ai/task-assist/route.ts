import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const maxDuration = 30;

const schema = z.object({
  taskTitle: z.string().min(1).max(300),
  context: z.string().max(1000).optional(),
  projectName: z.string().max(100).optional(),
});

const SYSTEM_PROMPT = `You are a senior software project manager and business analyst. Your job is to write clear, professional task descriptions for software development teams.

Given a task title and optional context, generate a structured description using EXACTLY this markdown format — no intro, no closing remarks, output only the content below:

## User Story
As a [specific user role], I want to [specific action or goal] so that [specific business benefit or value].

## Description
[Write 2-3 focused paragraphs covering: what needs to be built or done, why it matters to the business or users, key technical or UX considerations, and any important constraints or dependencies. Be specific and practical.]

## Acceptance Criteria
- [ ] [Specific, testable criterion describing expected behavior — written as a verifiable condition]
- [ ] [Specific, testable criterion describing expected behavior — written as a verifiable condition]
- [ ] [Specific, testable criterion describing expected behavior — written as a verifiable condition]
- [ ] [Specific, testable criterion describing expected behavior — written as a verifiable condition]
- [ ] [Specific, testable criterion describing expected behavior — written as a verifiable condition]

Rules:
- Output ONLY the markdown above — no preamble, no "Here is your task description", no commentary
- User Story must name a real, specific role (e.g. "registered user", "workspace admin", "project manager", "developer")
- Acceptance Criteria must be specific and testable — avoid vague language like "works correctly" or "is good"
- Each acceptance criterion should start with a clear action word (e.g. "User can...", "System displays...", "API returns...", "Error message appears...")`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { taskTitle, context, projectName } = parsed.data;

  const userMessage = [
    `Task title: ${taskTitle}`,
    projectName ? `Project: ${projectName}` : null,
    context ? `Additional context: ${context}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error("[TASK_ASSIST]", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}

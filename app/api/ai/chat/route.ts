import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { z } from "zod";

export const maxDuration = 30;

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { message, conversationId } = parsed.data;
    const userId = session.user.id;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.aiConversation.findUnique({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
      });
    }

    if (!conversation) {
      conversation = await db.aiConversation.create({
        data: { userId, title: message.slice(0, 50) },
        include: { messages: true },
      });
    }

    // Build message history
    const history = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant",
      content: m.content,
    }));
    history.push({ role: "user", content: message });

    const systemPrompt = `You are an AI assistant integrated into NexusAI, an AI-powered team workspace platform. You help teams collaborate, manage projects, and be more productive.

Your capabilities:
- Help with project planning and task breakdowns
- Write and review code, documents, emails, and messages
- Analyze data and provide insights
- Brainstorm ideas and provide creative solutions
- Answer questions about business, productivity, and teamwork

Be concise but thorough. Use markdown formatting when helpful. Be friendly and professional.`;

    // Call Claude API (non-streaming for reliability)
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const assistantText = response.content[0].type === "text"
      ? response.content[0].text
      : "Sorry, I could not generate a response.";

    // Save both messages
    await db.aiMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: message },
    });
    await db.aiMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: assistantText },
    });

    // Update title on first message
    if (conversation.messages.length === 0) {
      await db.aiConversation.update({
        where: { id: conversation.id },
        data: { title: message.slice(0, 60) },
      });
    }

    return NextResponse.json({
      text: assistantText,
      conversationId: conversation.id,
    });

  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ error: "AI service error", detail: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await db.aiConversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(conversations);
}

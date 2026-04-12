import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { z } from "zod";

// Increase function timeout for streaming responses
export const maxDuration = 60;

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
  context: z.string().optional(),
});

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { message, conversationId, context } = parsed.data;
    const userId = session.user.id;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

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
        data: {
          userId,
          title: message.slice(0, 50),
        },
        include: { messages: true },
      });
    }

    // Build message history for Claude
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
- Answer questions about software development, product management, and team processes
- Summarize lengthy content or conversations
- Brainstorm ideas and provide creative solutions
- Help debug issues and troubleshoot problems

Be concise but thorough. Use markdown formatting when helpful (code blocks, lists, headers). Be friendly and professional.
${context ? `\nWorkspace context: ${context}` : ""}`;

    const client = getClient();

    // Save user message first
    await db.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: message,
      },
    });

    // Stream response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: systemPrompt,
            messages: history,
          });

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const text = chunk.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text, conversationId: conversation!.id })}\n\n`)
              );
            }
          }

          // Save assistant response
          await db.aiMessage.create({
            data: {
              conversationId: conversation!.id,
              role: "ASSISTANT",
              content: fullResponse || "No response generated.",
            },
          });

          // Update title on first message
          if (conversation!.messages.length === 0) {
            await db.aiConversation.update({
              where: { id: conversation!.id },
              data: { title: message.slice(0, 60) + (message.length > 60 ? "..." : "") },
            });
          }
        } catch (streamError) {
          console.error("[AI_STREAM_ERROR]", streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: "\n\n*Error generating response. Please try again.*" })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

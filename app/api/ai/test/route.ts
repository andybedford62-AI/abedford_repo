import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const results: Record<string, string> = {};

  // 1. Check env var
  results.anthropic_key = process.env.ANTHROPIC_API_KEY
    ? `✅ Found (starts with ${process.env.ANTHROPIC_API_KEY.slice(0, 12)}...)`
    : "❌ MISSING - not set in environment";

  results.database_url = process.env.DATABASE_URL
    ? "✅ Found"
    : "❌ MISSING";

  results.auth_secret = process.env.AUTH_SECRET
    ? "✅ Found"
    : "❌ MISSING";

  // 2. Check auth session
  try {
    const session = await auth();
    results.auth_session = session?.user?.id
      ? `✅ Logged in as ${session.user.email}`
      : "⚠️ Not logged in (visit this page after logging in)";
  } catch (e) {
    results.auth_session = `❌ Auth error: ${e}`;
  }

  // 3. Check database
  try {
    await db.user.count();
    results.database = "✅ Connected";
  } catch (e) {
    results.database = `❌ Database error: ${e}`;
  }

  // 4. Check Anthropic API
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      results.anthropic_api = "❌ Skipped - no API key";
    } else {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 20,
        messages: [{ role: "user", content: "Say: OK" }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "no text";
      results.anthropic_api = `✅ Working! Response: "${text}"`;
    }
  } catch (e) {
    results.anthropic_api = `❌ Anthropic error: ${e}`;
  }

  return NextResponse.json(results, { status: 200 });
}

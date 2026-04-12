import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const results: Record<string, string> = {};

  // 1. Check env var
  const rawKey = process.env.ANTHROPIC_API_KEY ?? "";
  const trimmedKey = rawKey.trim();
  if (!rawKey) {
    results.anthropic_key = "❌ MISSING - not set in environment";
  } else {
    const hasWhitespace = rawKey !== trimmedKey;
    const last4 = trimmedKey.slice(-4);
    results.anthropic_key = `✅ Found (starts with ${trimmedKey.slice(0, 16)}..., ends with ...${last4}, length=${trimmedKey.length}${hasWhitespace ? ", ⚠️ HAD WHITESPACE - trimmed" : ""})`;
  }

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
    if (!trimmedKey) {
      results.anthropic_api = "❌ Skipped - no API key";
    } else {
      const client = new Anthropic({ apiKey: trimmedKey });
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

// src/app/api/chat/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorStore";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { verifyTenantToken } from "@/lib/tenantToken";
import { auth } from "@/lib/auth";
import { namespaceForTenant } from "@/lib/tenant";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { question, topK = 6, token } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // 1) Resolve tenant
  let tenantId: string | undefined;
  if (token) {
    try {
      const { tid } = verifyTenantToken(token);
      tenantId = tid;
      try {
        await supabaseAdmin.from("queries").insert({
          tenant_email: tenantId,
          question,
        });
      } catch {
        // best-effort; don't block chat on analytics
      }
    } catch {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
    }
  } else {
    // Admin preview (logged-in owner)
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    tenantId = (session.user as any).id ?? session.user.email ?? undefined;
  }

  if (!tenantId) return NextResponse.json({ error: "Missing tenant id" }, { status: 500 });


  const namespace = namespaceForTenant(tenantId);
  // console.log("CHAT ns:", namespace, "tenant:", tenantId);

  // 2) Retrieve only from tenant namespace
  const store = await getVectorStore(namespace);
  const docs = await store.asRetriever(topK).invoke(question);

  if (!docs.length) {
    return NextResponse.json({
      answer: "I don’t know based on the provided documents.",
      citations: [],
    });
  }

  // 3) Build context + call LLM
  const context = docs
    .map(
      (d, i) =>
        `[[${i + 1}]]${d.metadata?.loc?.pageNumber ? ` (page ${d.metadata.loc.pageNumber})` : ""} ${d.pageContent}`
    )
    .join("\n\n");

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY!,
    temperature: 0.3,
  });

  const res = await llm.invoke([
    new SystemMessage(`You are "VenueBot". Use ONLY the provided CONTEXT. Be warm, concise, and prefer Markdown bullet lists when helpful.`),
    new HumanMessage(`CONTEXT:\n${context}\n\nQUESTION:\n${question}`),
  ]);

  return NextResponse.json({
    answer: String(res.content),
    citations: docs.map((_, i) => i + 1),
  });
}

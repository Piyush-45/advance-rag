/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorStore";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { namespaceForTenant } from "@/lib/tenant";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, topK = 6 } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // derive tenant + namespace on the SERVER
  const tenantId = (session.user as any).id ?? session.user.email;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant id" }, { status: 500 });
  }
  const namespace = namespaceForTenant(tenantId);
  console.log("CHAT ns:", namespace, "email:", session.user.email);

  const store = await getVectorStore(namespace);
  const docs = await store.asRetriever(topK).invoke(question);

  if (!docs.length) {
    return NextResponse.json({
      answer: "I don’t know based on the provided documents.",
      citations: [],
    });
  }

  const context = docs
    .map(
      (d, i) =>
        `[[${i + 1}]]${
          d.metadata?.loc?.pageNumber ? ` (page ${d.metadata.loc.pageNumber})` : ""
        } ${d.pageContent}`
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

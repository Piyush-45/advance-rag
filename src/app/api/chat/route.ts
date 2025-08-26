// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorStore";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { question, topK = 6 } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Retrieve from in-memory store
  const store = await getVectorStore();
  const retriever = store.asRetriever(topK);
  const docs = await retriever.invoke(question);

  if (!docs?.length) {
    return NextResponse.json({
      answer: "I don’t know based on the provided documents.",
      citations: [],
    });
  }

  const context = docs
    .map((d, i) => {
      const page = d.metadata?.loc?.pageNumber;
      return `[[${i + 1}]]${page ? ` (page ${page})` : ""} ${d.pageContent}`;
    })
    .join("\n\n");

  const system = new SystemMessage(
    "You are an expert assistant for a wedding venue. " +
      "Answer ONLY using the provided CONTEXT. If the answer is not present, say you don’t know. " +
      "Use concise, friendly language and include citations like [1], [2]."
  );

  const user = new HumanMessage(
    `CONTEXT:\n${context}\n\nQUESTION:\n${question}\n\nAnswer clearly with citations.`
  );

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY!, // explicit
  });

  const res = await llm.invoke([system, user]);

  return NextResponse.json({
    answer: typeof res.content === "string" ? res.content : String(res.content),
    citations: docs.map((_, i) => i + 1),
  });
}

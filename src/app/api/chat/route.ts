// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorStore";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { question, topK = 6, namespace } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

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
    temperature: 0.3, // a bit more factual/concise
  });

  const res = await llm.invoke([
    new SystemMessage(`
You are "VenueBot", a friendly and knowledgeable assistant that speaks like a helpful wedding coordinator.
Answer questions using ONLY the provided CONTEXT. If you don’t find the answer in context, say so politely.

When asked about pricing or estimates:
- If the CONTEXT includes numbers, give a clear rough estimate using those numbers.
- If no numbers are in CONTEXT, explain that exact pricing isn’t available and offer next steps (e.g., consultation).
- Never invent numbers not present in the provided text.

Formatting:
- When the answer includes multiple items (features, facilities, steps, options),
  output them as a Markdown bullet list (each item starts with "- ").
- Use short phrases per bullet; avoid long sentences.

Tone:
- Warm, approachable, human — like you're talking to an excited couple planning their wedding.
- Keep answers concise but engaging.
- Use natural phrases: "Of course!", "Here’s what’s included", "I’d be happy to explain…"

Style:
- Prefer short paragraphs or simple lists (not dense walls of text).
- If appropriate, highlight key details with **bold** labels (e.g., **Capacity**, **Pricing**).
- If the answer includes multiple features, facilities, or options, format them as a neat bullet or numbered list.
- Keep sentences short and clear.
- For greetings or casual chit-chat ("hi", "how are you"), respond naturally without forcing context.

`),
    new HumanMessage(`
CONTEXT:
${context}

QUESTION:
${question}

Guidelines:
- Answer conversationally, like a human assistant.
- Don’t over-explain; summarize and keep it engaging.
- If details repeat, merge them smoothly.
- End with a friendly offer, like: "Would you like me to share more about catering or pricing?"
`),
  ]);

  return NextResponse.json({
    answer: String(res.content),
    citations: docs.map((_, i) => i + 1),
  });
}

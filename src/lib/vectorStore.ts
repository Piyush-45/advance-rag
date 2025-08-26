// lib/vectorStore.ts
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

/**
 * Singleton in-memory vector store (clears on server restart).
 * Uses Gemini text-embedding-004 (768-dim).
 */
const g = globalThis as unknown as { __store?: MemoryVectorStore };

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (!g.__store) {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: process.env.GOOGLE_API_KEY!, // explicit to avoid silent misses
    });
    g.__store = new MemoryVectorStore(embeddings);
  }
  return g.__store!;
}

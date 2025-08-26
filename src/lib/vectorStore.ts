// lib/vectorStore.ts
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "./pinecone";
import { geminiEmbeddings } from "./embeddings";

export async function getVectorStore(namespace?: string) {
  const index = pineconeIndex();
  return PineconeStore.fromExistingIndex(geminiEmbeddings, {
    pineconeIndex: index,
    namespace,            // e.g., `user:${userId}` for multi-tenant
    maxConcurrency: 5,    // per docs
  });
}

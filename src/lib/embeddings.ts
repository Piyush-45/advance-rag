// lib/embeddings.ts (LangChain wrapper; single source)
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",          // 768 dim
  apiKey: process.env.GOOGLE_API_KEY!,
});

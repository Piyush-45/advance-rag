// // lib/embeddings.ts
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// /**
//  * Gemini embeddings (768-dim) with explicit API key.
//  * Make sure .env.local has: GOOGLE_API_KEY=...
//  */
// export const embeddings = new GoogleGenerativeAIEmbeddings({
//   model: "embedding-001",
//   apiKey:"AIzaSyAw4dXbWwSrIeRN8EhtEeVrZDqhfRfo9Wc",
// });

// // Optional quick self-test (comment out in prod)
// (async () => {
//   try {
//     const v = await embeddings.embedQuery("hello");
//     console.log("Gemini embedding dim:", v.length); // should be 768
//   } catch (e) {
//     console.error("Embeddings init failed:", e);
//   }
// })();
import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY = process.env.GOOGLE_API_KEY!;
if (!KEY) throw new Error("GOOGLE_API_KEY missing");

const genAI = new GoogleGenerativeAI(KEY);
// text-embedding-004 → 768 dims
const embModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function embedOne(text: string): Promise<number[]> {
  const res = await embModel.embedContent({ content: text });
  const v = res.embedding?.values ?? [];
  if (!Array.isArray(v) || v.length !== 768) {
    throw new Error(`Bad embedding len=${Array.isArray(v) ? v.length : -1}`);
  }
  return v as number[];
}

export async function embedMany(texts: string[], batchSize = 16): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    // parallel within the slice, retry on transient failures
    let tries = 0;

    while (true) {
      try {
        const vecs = await Promise.all(slice.map(t => embedOne(t)));
        out.push(...vecs);
        break;
      } catch (e) {
        tries++;
        if (tries >= 3) throw e;
        await new Promise(r => setTimeout(r, 400 * tries));
      }
    }
  }
  return out;
}

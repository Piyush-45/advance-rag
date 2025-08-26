import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function chatWithContext(context: string, query: string) {
  const prompt = `
You are a helpful assistant. Answer the question using the CONTEXT below.
If not found, say "I don’t know".
Always cite sources like [1], [2].

CONTEXT:
${context}

QUESTION:
${query}
  `;

  const res = await chatModel.generateContent(prompt);
  return res.response.text();
}

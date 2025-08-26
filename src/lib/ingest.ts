// lib/ingest.ts
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "@/lib/vectorStore";

export type UploadResult = { pages: number; chunks: number };

/**
 * In-memory ingestion:
 * - save temp → parse PDF → chunk → add to MemoryVectorStore
 */
export async function handleUploadAndIndex(file: File): Promise<UploadResult> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const tempPath = join(tmpdir(), `upload-${Date.now()}.pdf`);
  await writeFile(tempPath, bytes);

  try {
    // Parse pages
    const loader = new PDFLoader(tempPath);
    const rawDocs = await loader.load();

    // Chunk ~200–300 tokens (rough) with overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 120,
    });

    let docs = await splitter.splitDocuments(rawDocs);

    // Drop empty/tiny chunks (helps avoid useless embeddings)
    docs = docs.filter((d) => (d.pageContent || "").trim().length >= 20);
    if (docs.length === 0) return { pages: rawDocs.length, chunks: 0 };

    // Index into in-memory vector store
    const store = await getVectorStore();
    await store.addDocuments(docs);

    return { pages: rawDocs.length, chunks: docs.length };
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}

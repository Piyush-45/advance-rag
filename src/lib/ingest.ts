// lib/ingest.ts  (parse → chunk → addDocuments)
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "./vectorStore";

export async function handleUploadAndIndex(file: File, namespace?: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const temp = join(tmpdir(), `upload-${Date.now()}.pdf`);
  await writeFile(temp, bytes);
  try {
    const loader = new PDFLoader(temp);
    const pages = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 120 });
    let docs = await splitter.splitDocuments(pages);
    docs = docs.filter(d => (d.pageContent || "").trim().length >= 20);

    const store = await getVectorStore(namespace);
    // LangChain handles embedding via geminiEmbeddings + batching
    await store.addDocuments(docs);
    return { pages: pages.length, chunks: docs.length };
  } finally { await unlink(temp).catch(() => {}); }
}

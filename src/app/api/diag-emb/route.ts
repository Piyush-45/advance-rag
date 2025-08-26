// app/api/diag-emb/route.ts
import { NextResponse } from "next/server";
import { embeddings } from "@/lib/embeddings";
export async function GET() {
  try {
    const v = await embeddings.embedQuery("ping");
    return NextResponse.json({ dim: v.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// app/api/upload/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { namespaceForTenant } from "@/lib/tenant";
import { getVectorStore } from "@/lib/vectorStore";
import { handleUploadAndIndex } from "@/lib/ingest";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 0) Auth + tenant
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantEmail = session.user.email;
  const namespace = namespaceForTenant(tenantEmail);

  // 1) Read form (and file) up front
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const fileBytes = Buffer.from(await file.arrayBuffer());
  const objectPath = `${tenantEmail}/${Date.now()}-${file.name}`; // brochures/<email>/<ts>-<file>.pdf

  try {
    // 2) Ensure tenant row exists (conflict on unique 'email')
    const { error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .upsert({ email: tenantEmail }, { onConflict: "email" });
    if (tenantErr) throw new Error(tenantErr.message);

    // 3) Upload PDF to Supabase Storage (bucket must exist and be private)
    const { error: storageErr } = await supabaseAdmin.storage
      .from("brochures")
      .upload(objectPath, fileBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (storageErr) throw new Error(`Storage upload failed: ${storageErr.message}`);

    // 4) Mark uploads row as "processing" (single active row per tenant)
    const processingMeta = {
      tenant_email: tenantEmail,
      file_name: file.name,
      storage_path: objectPath, // NOT NULL in your schema
      status: "processing" as const,
      pages: null,
      chunks: null,
    };
    const { error: upsertErr } = await supabaseAdmin
      .from("uploads")
      .upsert(processingMeta, { onConflict: "tenant_email" });
    if (upsertErr) throw new Error(upsertErr.message);

    // 5) Wipe old vectors in Pinecone (ignore 404 on first-time namespace)
    const store = await getVectorStore(namespace);
    try {
      await store.delete({ deleteAll: true });
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (
        err?.name === "PineconeNotFoundError" ||
        msg.includes("status 404") ||
        msg.toLowerCase().includes("not found")
      ) {
        // first upload for this tenant → namespace doesn't exist yet; safe to ignore
      } else {
        throw err;
      }
    }

    // 6) Index new file (parse → chunk → embed → upsert)
    const result = await handleUploadAndIndex(file, namespace); // { pages, chunks }

    // 7) Mark ready with metadata
    const { error: readyErr } = await supabaseAdmin
      .from("uploads")
      .update({
        status: "ready",
        pages: result.pages,
        chunks: result.chunks,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_email", tenantEmail);
    if (readyErr) throw new Error(readyErr.message);

    return NextResponse.json({ ok: true, status: "ready", ...result });
  } catch (e: any) {
    console.error("Upload error:", e?.message || e);
    // Best-effort flip to "error" (ignore any failure here)
    try {
      await supabaseAdmin
        .from("uploads")
        .update({ status: "error", updated_at: new Date().toISOString() })
        .eq("tenant_email", tenantEmail);
    } catch {}
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}

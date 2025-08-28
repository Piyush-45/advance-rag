/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { namespaceForTenant } from "@/lib/tenant";
import { handleUploadAndIndex } from "@/lib/ingest";
import { setUploadStatus } from "@/lib/uploadStatus";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  console.log("Session object:", session);

  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const tenantId = (session.user.email as any);
  if (!tenantId) return NextResponse.json({ error: "Missing user id" }, { status: 500 });
  const namespace = namespaceForTenant(tenantId);
  console.log("UPLOAD ns:", namespace);
  // mark processing
  setUploadStatus(namespace, "processing");

  // run indexing in background (don't await)
  handleUploadAndIndex(file, namespace)
    .then(() => setUploadStatus(namespace, "ready"))
    .catch(() => setUploadStatus(namespace, "error"));

  return NextResponse.json({ ok: true, status: "processing" });
}

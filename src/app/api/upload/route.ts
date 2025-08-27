/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUploadAndIndex } from "@/lib/ingest";
import { namespaceForTenant } from "@/lib/tenant";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Only admins should upload — for now, just check signed in
  const session = await auth();
  console.log("from upload route",session?.user?.email)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  try {
    // Namespace by user id (multi-tenant isolation)
    const tenantId = (session.user as any).id ?? session.user.email
    if (!tenantId) return NextResponse.json({ error: "Missing tenant id" }, { status: 500 });

  const namespace = namespaceForTenant(tenantId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await handleUploadAndIndex(file, namespace );
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

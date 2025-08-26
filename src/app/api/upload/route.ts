// // app/api/upload/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { handleUploadAndIndex } from "@/lib/ingest";

// export const runtime = "nodejs"; // required for FS/pdf parsing

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File | null;
//   if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

//   try {
//     const result = await handleUploadAndIndex(file);
//     return NextResponse.json({ ok: true, ...result });
//   } catch (e) {
//     const msg = e instanceof Error ? e.message : String(e);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleUploadAndIndex } from "@/lib/ingest";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Only admins should upload — for now, just check signed in
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  try {
    // Namespace by user id (multi-tenant isolation)
    const result = await handleUploadAndIndex(file, (session.user as any).id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// app/api/admin/preview-url/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;

  // fetch current upload row
  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("storage_path, updated_at")
    .eq("tenant_email", email)
    .single();

  if (error || !data?.storage_path) {
    return NextResponse.json({ error: "No brochure found" }, { status: 404 });
  }

  // sign a short-lived URL (5 minutes)
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("brochures")
    .createSignedUrl(data.storage_path, 60 * 5);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
  }

  return NextResponse.json({
    url: signed.signedUrl,
    updatedAt: data.updated_at,
  });
}

// app/api/admin/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { namespaceForTenant } from "@/lib/tenant";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantEmail = session.user.email;
  const namespace = namespaceForTenant(tenantEmail);

  const { data, error } = await supabaseAdmin
    .from("uploads")
    .select("*")
    .eq("tenant_email", tenantEmail)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const info = data
    ? {
        status: data.status,
        fileName: data.file_name,
        pages: data.pages,
        chunks: data.chunks,
        namespace,
      }
    : { status: "idle" as const, namespace };

  return NextResponse.json({ user: session.user, ...info });
}

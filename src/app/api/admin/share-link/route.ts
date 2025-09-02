// app/api/admin/share-link/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantEmail = session.user.email;

  // 1) Try to fetch existing share_link
  const { data: tenant, error } = await supabaseAdmin
    .from("tenants")
    .select("share_link")
    .eq("email", tenantEmail)
    .single();

  if (error) {
    return NextResponse.json({ error: "DB fetch error" }, { status: 500 });
  }

  if (tenant?.share_link) {
    return NextResponse.json({ url: tenant.share_link });
  }

  // 2) Generate new link (first-time only)
  const token = jwt.sign(
    { tid: tenantEmail },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" } // token expiry — adjust as needed
  );

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/chat?token=${token}`;

  // 3) Save in DB
  const { error: updateErr } = await supabaseAdmin
    .from("tenants")
    .update({ share_link: url })
    .eq("email", tenantEmail);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to save share link" }, { status: 500 });
  }

  return NextResponse.json({ url });
}

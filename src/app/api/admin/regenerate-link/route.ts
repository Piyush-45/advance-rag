// app/api/admin/regenerate-link/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantEmail = session.user.email;

  // Generate new JWT
  const token = jwt.sign(
    { tid: tenantEmail },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const url = `${baseUrl}/chat?token=${token}`;

  // Overwrite in DB
  const { error } = await supabaseAdmin
    .from("tenants")
    .update({ share_link: url })
    .eq("email", tenantEmail);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url });
}

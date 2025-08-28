// app/api/admin/share-link/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantEmail = session.user.email;

  // Create signed token (valid for 7 days)
  const token = jwt.sign(
    { tid: tenantEmail }, // payload
    process.env.JWT_SECRET!, // make sure JWT_SECRET is set in .env.local
    { expiresIn: "7d" }
  );

  // Absolute URL to /chat?token=...
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/chat?token=${token}`;

  return NextResponse.json({ url });
}

// src/app/api/admin/share-link/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // your getServerSession() helper is fine
import { signTenantToken } from "@/lib/tenantToken";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = (session.user.email as any)?? session.user.email;
  if (!tenantId) return NextResponse.json({ error: "Missing tenant id" }, { status: 500 });

  const token = signTenantToken(tenantId);
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${base}/chat?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ url });
}

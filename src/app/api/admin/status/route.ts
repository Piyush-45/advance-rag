/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/status/route.ts
import { auth } from "@/lib/auth";
import { namespaceForTenant } from "@/lib/tenant";
// import { getUploadInfo } from "@/lib/uploadStatus";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = (session.user.email as any);
  const namespace = namespaceForTenant(tenantId);

  // const info = getUploadInfo(namespace);
  return NextResponse.json({ namespace,  user: session.user });
}

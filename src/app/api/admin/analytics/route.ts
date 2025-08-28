// app/api/admin/analytics/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "7d") as "7d" | "30d" | "all";

  const now = Date.now();
  const since =
    range === "7d"  ? new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString() :
    range === "30d" ? new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString() :
    null; // all-time

  // totals
  const { count: totalAll } = await supabaseAdmin
    .from("queries")
    .select("*", { count: "exact", head: true })
    .eq("tenant_email", email);

  const { count: totalRange } = await supabaseAdmin
    .from("queries")
    .select("*", { count: "exact", head: true })
    .eq("tenant_email", email)
    .gte("created_at", since ?? "1970-01-01");

  // top queries for selected range (aggregate in node)
  const { data: rows } = await supabaseAdmin
    .from("queries")
    .select("question")
    .eq("tenant_email", email)
    .gte("created_at", since ?? "1970-01-01")
    .order("created_at", { ascending: false })
    .limit(1000);

  const counts = new Map<string, number>();
  for (const r of rows ?? []) {
    const q = (r.question || "").trim();
    if (!q) continue;
    counts.set(q, (counts.get(q) || 0) + 1);
  }
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([question, count]) => ({ question, count }));

  return NextResponse.json({
    range,
    totalRange: totalRange ?? 0,
    totalAll: totalAll ?? 0,
    top,
  });
}

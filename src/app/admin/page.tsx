// // app/admin/page.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { LogoutButton } from "@/components/admin/LogoutButton";

// // -------- types from your status/analytics APIs --------
// type UploadInfo = {
//   namespace?: string;
//   status: "idle" | "processing" | "ready" | "error";
//   fileName?: string;
//   pages?: number;
//   chunks?: number;
//   updatedAt?: string;
//   user?: { name?: string; email?: string; image?: string };
// };
// type TopQuery = { question: string; count: number };

// // ----------------------- page -------------------------
// export default function AdminPage() {
//   // status
//   const [info, setInfo] = useState<UploadInfo>({ status: "idle" });
//   const isProcessing = info.status === "processing";

//   // share link
//   const [shareLink, setShareLink] = useState<string>("");
//   const [copied, setCopied] = useState(false);

//   // analytics
//   const [range, setRange] = useState<"7d" | "30d" | "all">("7d");
//   const [aLoading, setALoading] = useState(true);
//   const [totalRange, setTotalRange] = useState(0);
//   const [totalAll, setTotalAll] = useState(0);
//   const [top, setTop] = useState<TopQuery[]>([]);

//   const [busy, setBusy] = useState(false);

//   const canGenerate = info.status === "ready" && !busy;

//   // ---------- data fetchers ----------
//   async function fetchStatus() {
//     const res = await fetch("/api/admin/status", { cache: "no-store" });
//     if (!res.ok) return;
//     const data = (await res.json()) as UploadInfo;
//     setInfo((prev) => ({ ...prev, ...data }));
//   }

//   async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const fd = new FormData(e.currentTarget);
//     setBusy(true);
//     setShareLink("");
//     setCopied(false);

//     const res = await fetch("/api/upload", { method: "POST", body: fd });
//     setBusy(false);
//     if (!res.ok) {
//       setInfo((p) => ({ ...p, status: "error" }));
//       return;
//     }
//     // flip UI to "processing" immediately; polling updates to "ready"
//     setInfo((p) => ({ ...p, status: "processing" }));
//   }

//   async function generateShareLink() {
//     try {
//       setBusy(true);
//       setCopied(false);
//       const res = await fetch("/api/admin/share-link", { cache: "no-store" });
//       if (!res.ok) return;
//       const data = await res.json();
//       setShareLink(data.url || "");
//     } finally {
//       setBusy(false);
//     }
//   }

//   function copyLink() {
//     if (!shareLink) return;
//     navigator.clipboard.writeText(shareLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1400);
//   }

//   function openLiveDemo() {
//     if (!shareLink) return;
//     window.open(shareLink, "_blank", "noopener,noreferrer");
//   }

//   async function fetchAnalytics(r: typeof range) {
//     setALoading(true);
//     const res = await fetch(`/api/admin/analytics?range=${r}`, { cache: "no-store" });
//     if (res.ok) {
//       const d = await res.json();
//       setTotalRange(d.totalRange || 0);
//       setTotalAll(d.totalAll || 0);
//       setTop(d.top || []);
//     }
//     setALoading(false);
//   }

//   // ---------- effects ----------
//   useEffect(() => {
//     fetchStatus();
//   }, []);

//   // poll status while processing
//   useEffect(() => {
//     if (info.status === "processing") {
//       const t = setInterval(fetchStatus, 2000);
//       return () => clearInterval(t);
//     }
//   }, [info.status]);

//   // analytics load/toggle
//   useEffect(() => {
//     fetchAnalytics(range);
//   }, [range]);

//   const lastUpdated = useMemo(() => {
//     if (!info.updatedAt) return "—";
//     const d = new Date(info.updatedAt);
//     return d.toLocaleString();
//   }, [info.updatedAt]);

//   return (
//     <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
//       {/* ----- Page Header ----- */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Namespace: <code className="text-xs">{info.namespace || "—"}</code>
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           {info.user?.image ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={info.user.image}
//               alt="avatar"
//               className="h-9 w-9 rounded-full border object-cover"
//             />
//           ) : null}
//           <div className="text-right">
//             <div className="text-sm font-medium">{info.user?.name || "—"}</div>
//             <div className="text-xs text-muted-foreground">{info.user?.email || "—"}</div>
//           </div>
//           <LogoutButton />
//         </div>
//       </div>

//       {/* ----- Brochure ----- */}
//       <div className=" flex flex-1 flex-col  gap-y-4">
//         <Card className="shadow-sm">
//           <CardHeader className="border-b pb-3">
//             <CardTitle>Venue Brochure</CardTitle>
//           </CardHeader>
//           <CardContent className="pt-4">
//             <form onSubmit={handleUpload} className="flex flex-col gap-4 sm:flex-row sm:items-center">
//               <Input
//                 type="file"
//                 name="file"
//                 accept="application/pdf"
//                 required
//                 disabled={isProcessing || busy}
//               />
//               <div className="flex gap-2">
//                 <Button type="submit" disabled={isProcessing || busy}>
//                   {isProcessing ? "Processing…" : "Upload / Replace"}
//                 </Button>
//                 <StatusBadge status={info.status} />
//               </div>
//             </form>

//             <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
//               <Field label="File" value={info.fileName || "—"} />
//               <Field label="Pages" value={info.pages ?? "—"} />
//               <Field label="Chunks" value={info.chunks ?? "—"} />
//             </div>

//             <div className="mt-4 text-xs text-muted-foreground">
//               Last updated: <span className="text-foreground">{lastUpdated}</span>
//             </div>
//           </CardContent>
//         </Card>

//         {/* ----- Share Link ----- */}
//         <Card className="shadow-sm">
//           <CardHeader className="border-b pb-3">
//             <CardTitle>Share Link</CardTitle>
//           </CardHeader>
//           <CardContent className="pt-4 space-y-3">
//             <div className="flex items-center gap-2">
//             <input
//   className="input flex-1 min-w-[320px]"
//   value={shareLink ?? ""}   // <= never undefined
//   readOnly
//   placeholder="Generate a link…"
// />
//               {shareLink ? (
//                 <>
//                   <Button variant="outline" onClick={copyLink} disabled={busy}>
//                     {copied ? "Copied!" : "Copy"}
//                   </Button>
//                   <Button onClick={openLiveDemo} disabled={busy}>
//                     Live demo
//                   </Button>
//                   <Button variant="ghost" onClick={generateShareLink} disabled={!canGenerate}>
//                     Generate new
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button onClick={generateShareLink} disabled={!canGenerate}>
//                     Generate link
//                   </Button>
//                 </>
//               )}
//             </div>
//             {info.status !== "ready" && (
//               <p className="text-xs text-muted-foreground">
//                 Upload and wait until status is{" "}
//                 <span className="font-medium text-green-700 ">Ready</span> to generate a link.
//               </p>
//             )}
//           </CardContent>
//         </Card>

//         {/* ----- Analytics ----- */}
//         <Card className="shadow-sm">
//           <CardHeader className="border-b pb-3 flex items-center justify-between">
//             <CardTitle>Analytics</CardTitle>
//             <RangePills value={range} onChange={setRange} />
//           </CardHeader>
//           <CardContent className="pt-4 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <Stat label={`Total chats (${labelFor(range)})`} value={aLoading ? "…" : totalRange} />
//               <Stat label="Total chats (all-time)" value={aLoading ? "…" : totalAll} />
//             </div>

//             <section>
//               <div className="text-xs uppercase text-muted-foreground mb-2">
//                 Most Asked Queries ({labelFor(range)})
//               </div>
//               {aLoading ? (
//                 <div className="text-muted-foreground">Loading…</div>
//               ) : top.length ? (
//                 <ul className="list-disc pl-5 space-y-1">
//                   {top.map((t, i) => (
//                     <li key={i}>
//                       <span className="font-medium">{t.question}</span>{" "}
//                       <span className="text-muted-foreground">×{t.count}</span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div className="text-muted-foreground">No queries yet.</div>
//               )}
//             </section>
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   );
// }

// // ------------------- tiny UI helpers -------------------
// function Field({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="rounded-md border p-3">
//       <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
//       <div className="mt-1 text-sm">{value}</div>
//     </div>
//   );
// }

// function Stat({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="rounded-md border p-3 flex items-center justify-between">
//       <span className="text-muted-foreground">{label}</span>
//       <span className="text-lg font-semibold">{value}</span>
//     </div>
//   );
// }

// function RangePills({
//   value,
//   onChange,
// }: {
//   value: "7d" | "30d" | "all";
//   onChange: (v: "7d" | "30d" | "all") => void;
// }) {
//   const base =
//     "px-2.5 py-1 rounded-full text-xs border transition focus:outline-none focus:ring-2 focus:ring-offset-1";
//   const active = "bg-foreground text-background border-transparent";
//   const idle = "bg-muted text-foreground border-transparent hover:bg-muted/70";
//   return (
//     <div className="flex gap-2">
//       <button className={`${base} ${value === "7d" ? active : idle}`} onClick={() => onChange("7d")}>
//         7d
//       </button>
//       <button
//         className={`${base} ${value === "30d" ? active : idle}`}
//         onClick={() => onChange("30d")}
//       >
//         30d
//       </button>
//       <button className={`${base} ${value === "all" ? active : idle}`} onClick={() => onChange("all")}>
//         All
//       </button>
//     </div>
//   );
// }

// function StatusBadge({
//   status,
// }: {
//   status: "idle" | "processing" | "ready" | "error";
// }) {
//   const styles: Record<typeof status, string> = {
//     idle: "bg-muted text-foreground",
//     processing:
//       "bg-yellow-100 text-yellow-900 border border-yellow-300",
//     ready: "bg-green-100 text-green-900 border border-green-300",
//     error: "bg-red-100 text-red-900 border border-red-300",
//   };
//   return (
//     <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
//       {status === "idle" && "Idle"}
//       {status === "processing" && "Processing…"}
//       {status === "ready" && "Ready"}
//       {status === "error" && "Error"}
//     </span>
//   );
// }

// function labelFor(r: "7d" | "30d" | "all") {
//   if (r === "7d") return "7d";
//   if (r === "30d") return "30d";
//   return "all-time";
// }


// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutButton } from "@/components/admin/LogoutButton";

/* ----------------------- Types (same shape as your APIs) ----------------------- */
type UploadInfo = {
  namespace?: string;
  status: "idle" | "processing" | "ready" | "error";
  fileName?: string;
  pages?: number;
  chunks?: number;
  updatedAt?: string;
  user?: { name?: string; email?: string; image?: string };
};
type TopQuery = { question: string; count: number };

/* ---------------------------- Tiny Sparkline (SVG) ---------------------------- */
function Sparkline({ points, height = 40 }: { points: number[]; height?: number }) {
  if (!points.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const w = Math.max(2, points.length - 1);

  const d = points
    .map((v, i) => {
      const x = (i / w) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-black/80" />
      {/* soft gradient fill under line */}
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L 100 100 L 0 100 Z`}
        fill="url(#sg)"
        className="text-black/70"
        stroke="none"
      />
    </svg>
  );
}

/* -------------------------------- Main Page -------------------------------- */
export default function AdminPage() {
  // status
  const [info, setInfo] = useState<UploadInfo>({ status: "idle" });
  const isProcessing = info.status === "processing";

  // share link
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // analytics
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");
  const [aLoading, setALoading] = useState(true);
  const [totalRange, setTotalRange] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [top, setTop] = useState<TopQuery[]>([]);
  // sparkline demo values come from analytics endpoint (if provided)
  const [trend, setTrend] = useState<number[]>([]);

  const [busy, setBusy] = useState(false);
  const canGenerate = info.status === "ready" && !busy;

  /* ------------------------------- API calls ------------------------------- */
  async function fetchStatus() {
    const res = await fetch("/api/admin/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as UploadInfo;
    setInfo((prev) => ({ ...prev, ...data }));
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setShareLink("");
    setCopied(false);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      setInfo((p) => ({ ...p, status: "error" }));
      return;
    }
    // optimistic: flip to "processing" then polling will mark "ready"
    setInfo((p) => ({ ...p, status: "processing" }));
  }

  async function generateShareLink() {
    try {
      setBusy(true);
      setCopied(false);
      const res = await fetch("/api/admin/share-link", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setShareLink(data.url || "");
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function openLiveDemo() {
    if (!shareLink) return;
    window.open(shareLink, "_blank", "noopener,noreferrer");
  }

  async function fetchAnalytics(r: typeof range) {
    setALoading(true);
    const res = await fetch(`/api/admin/analytics?range=${r}`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setTotalRange(d.totalRange || 0);
      setTotalAll(d.totalAll || 0);
      setTop(d.top || []);
      // accept optional buckets/series = sparkline
      setTrend(d.trend || d.buckets || []);
    }
    setALoading(false);
  }

  /* -------------------------------- Effects -------------------------------- */
  useEffect(() => {
    fetchStatus();
  }, []);

  // poll while processing
  useEffect(() => {
    if (info.status === "processing") {
      const t = setInterval(fetchStatus, 2000);
      return () => clearInterval(t);
    }
  }, [info.status]);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const lastUpdated = useMemo(() => {
    if (!info.updatedAt) return "—";
    const d = new Date(info.updatedAt);
    return d.toLocaleString();
  }, [info.updatedAt]);

  /* --------------------------------- UI ---------------------------------- */
  return (
    <main className="mx-auto max-w-6xl px-6 py-10  space-y-10">
      {/* Welcome / header */}
      <section className="space-y-2.5 mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{info.user?.name ? `, ${info.user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Namespace:&nbsp;
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {info.namespace || "—"}
          </code>
        </p>
      </section>

      {/* 2-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left column (2/3): Brochure + Share */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brochure */}
          <Card className="shadow-sm rounded-2xl border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Venue Brochure</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  disabled={isProcessing || busy}
                  className="focus-visible:ring-1 focus-visible:ring-black/20"
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isProcessing || busy}>
                    {isProcessing ? "Processing…" : "Upload / Replace"}
                  </Button>
                  <StatusBadge status={info.status} />
                </div>
              </form>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="File" value={info.fileName || "—"} />
                <Field label="Pages" value={info.pages ?? "—"} />
                <Field label="Chunks" value={info.chunks ?? "—"} />
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Last updated: <span className="text-foreground">{lastUpdated}</span>
              </div>
            </CardContent>
          </Card>

          {/* Share Link */}
          <Card className="shadow-sm rounded-2xl border border-gray-200 mt-4">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Share Link</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={shareLink || ""} // controlled
                  readOnly
                  placeholder="Generate a link…"
                  className="flex-1 font-mono text-sm bg-muted/60 focus-visible:ring-1 focus-visible:ring-black/20"
                />
                {shareLink ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyLink} disabled={busy}>
                      {copied ? "✓ Copied" : "Copy"}
                    </Button>
                    <Button onClick={openLiveDemo} disabled={busy}>
                      Live demo
                    </Button>
                    <Button variant="ghost" onClick={generateShareLink} disabled={!canGenerate}>
                      Generate new
                    </Button>
                  </div>
                ) : (
                  <Button onClick={generateShareLink} disabled={!canGenerate}>
                    Generate link
                  </Button>
                )}
              </div>

              {info.status !== "ready" && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Upload and wait until status is <span className="font-medium">Ready</span> to
                  generate a link.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column (1/3): Analytics + Queries */}
        <div className="space-y-6">
          {/* Analytics */}
          <Card className="shadow-sm rounded-2xl border border-gray-200">
            <CardHeader className="border-b pb-4 flex items-center justify-between">
              <CardTitle className="text-lg">Analytics</CardTitle>
              <RangePills value={range} onChange={setRange} />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label={`Chats (${labelFor(range)})`} value={aLoading ? "…" : totalRange} />
                <Stat label="Chats (all-time)" value={aLoading ? "…" : totalAll} />
              </div>

              {/* sparkline */}
              <div className="rounded-lg border bg-gradient-to-b from-gray-50 to-white p-3">
                {aLoading ? (
                  <div className="text-sm text-muted-foreground">Loading trend…</div>
                ) : trend?.length ? (
                  <Sparkline points={trend} height={46} />
                ) : (
                  <div className="text-sm text-muted-foreground">No trend data yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Queries */}
          <Card className="shadow-sm rounded-2xl border border-gray-200 mt-4">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Popular Queries</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {aLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : top.length ? (
                <ul className="divide-y">
                  {top.map((t, i) => (
                    <li key={i} className="flex items-center justify-between py-2">
                      <span className="text-sm leading-5">{t.question}</span>
                      <span className="text-xs rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                        {t.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No queries yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ---------------------- Small UI helpers (polished) ---------------------- */

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3 bg-gray-50">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm break-words">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3 bg-white flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function RangePills({
  value,
  onChange,
}: {
  value: "7d" | "30d" | "all";
  onChange: (v: "7d" | "30d" | "all") => void;
}) {
  const base =
    "px-2.5 py-1 rounded-full text-xs border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10";
  const active = "bg-black text-black  border-black";
  const idle = "bg-white text-foreground border-gray-300 hover:bg-gray-50";
  return (
    <div className="flex gap-2">
      <button className={`${base} ${value === "7d" ? active : idle}`} onClick={() => onChange("7d")}>
        7d
      </button>
      <button className={`${base} ${value === "30d" ? active : idle}`} onClick={() => onChange("30d")}>
        30d
      </button>
      <button className={`${base} ${value === "all" ? active : idle}`} onClick={() => onChange("all")}>
        All
      </button>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "idle" | "processing" | "ready" | "error";
}) {
  const styles: Record<typeof status, string> = {
    idle: "bg-muted text-foreground",
    processing: "bg-yellow-100 text-yellow-900 border border-yellow-300",
    ready: "bg-green-100 text-green-900 border border-green-300",
    error: "bg-red-100 text-red-900 border border-red-300",
  };
  const text =
    status === "idle" ? "Idle" : status === "processing" ? "Processing…" : status === "ready" ? "Ready" : "Error";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{text}</span>;
}

function labelFor(r: "7d" | "30d" | "all") {
  if (r === "7d") return "7d";
  if (r === "30d") return "30d";
  return "all-time";
}

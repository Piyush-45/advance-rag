// app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { FileText, Copy, ExternalLink, RefreshCw, Link as LinkIcon, Eye } from "lucide-react";

/* ----------------------- Types ----------------------- */
type UploadInfo = {
  namespace?: string;
  status: "idle" | "processing" | "ready" | "error";
  fileName?: string;
  pages?: number;
  chunks?: number;
  user?: { name?: string; email?: string; image?: string };
};
type TopQuery = { question: string; count: number };

/* ----------------------- Main ----------------------- */
export default function AdminPage() {
  const [info, setInfo] = useState<UploadInfo>({ status: "idle" });
  const isProcessing = info.status === "processing";

  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");
  const [aLoading, setALoading] = useState(true);
  const [totalRange, setTotalRange] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [top, setTop] = useState<TopQuery[]>([]);

  const [busy, setBusy] = useState(false);
  const canGenerate = info.status === "ready" && !busy;

  /* ----------------------- API calls ----------------------- */
  async function fetchStatus() {
    const res = await fetch("/api/admin/status", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as UploadInfo;
    setInfo((prev) => ({ ...prev, ...data }));
  }

  async function fetchShareLink() {
    try {
      const res = await fetch("/api/admin/share-link", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setShareLink(data.url || "");
    } catch (err) {
      console.error("Error fetching share link:", err);
    }
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
    setTimeout(() => setCopied(false), 1400);
  }

  function openLiveDemo() {
    if (!shareLink) return;
    window.open(shareLink, "_blank", "noopener,noreferrer");
  }

  async function previewPDF() {
    try {
      const res = await fetch("/api/admin/preview-url", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Error previewing PDF:", err);
    }
  }

  async function fetchAnalytics(r: typeof range) {
    setALoading(true);
    const res = await fetch(`/api/admin/analytics?range=${r}`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setTotalRange(d.totalRange || 0);
      setTotalAll(d.totalAll || 0);
      setTop(d.top || []);
    }
    setALoading(false);
  }

  /* ----------------------- Effects ----------------------- */
  useEffect(() => {
    fetchStatus();
    fetchShareLink(); // ✅ retain link
  }, []);

  useEffect(() => {
    if (info.status === "processing") {
      const t = setInterval(fetchStatus, 2000);
      return () => clearInterval(t);
    }
  }, [info.status]);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);



  /* ----------------------- UI ----------------------- */
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Namespace: <code className="text-xs">{info.namespace || "—"}</code>
          </p>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Brochure + Share */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brochure */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle>Venue Brochure</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input type="file" name="file" accept="application/pdf" required disabled={isProcessing || busy} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={isProcessing || busy} className="bg-black text-white hover:bg-black/90 rounded-lg cursor-pointer">
                    {isProcessing ? "Processing…" : "Upload / Replace"}
                  </Button>
                  <StatusBadge status={info.status} />
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="File" value={info.fileName || "—"} />
                <Field label="Pages" value={info.pages ?? "—"} />
                <Field label="Chunks" value={info.chunks ?? "—"} />
              </div>

              {/* ✅ Preview PDF button */}
              {info.status === "ready" && (
                <Button onClick={previewPDF} className="bg-gray-100 text-black hover:bg-gray-200 rounded-lg cursor-pointer">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview PDF
                </Button>
              )}

            </CardContent>
          </Card>

          {/* Share Link */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle>Share Link</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={shareLink || ""}
                  readOnly
                  placeholder="Generate a link…"
                  className="flex-1 font-mono text-sm bg-muted/60 rounded-lg"
                />
                {shareLink ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyLink} className="rounded-lg border-gray-300 hover:bg-gray-50 cursor-pointer">
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button onClick={openLiveDemo} className="rounded-lg bg-black text-white hover:bg-black/90 cursor-pointer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live demo
                    </Button>
                    <Button variant="ghost" onClick={() => setShowConfirm(true)} className="rounded-lg text-red-600 hover:bg-red-50 cursor-pointer">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate new
                    </Button>
                  </div>
                ) : (
                  <Button onClick={generateShareLink} disabled={!canGenerate} className="rounded-lg bg-black text-white hover:bg-black/90 cursor-pointer">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Generate link
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (1/3): Analytics + Queries */}
        <div className="space-y-6">
          {/* Analytics */}
          <Card>
            <CardHeader className="border-b pb-3 flex items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <RangePills value={range} onChange={setRange} />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label={`Total chats (${labelFor(range)})`} value={aLoading ? "…" : totalRange} />
                <Stat label="Chats (all-time)" value={aLoading ? "…" : totalAll} />
              </div>

              <section>
                <div className="text-xs uppercase text-muted-foreground mb-2">Most Asked Queries</div>
                {aLoading ? (
                  <div className="text-muted-foreground">Loading…</div>
                ) : top.length ? (
                  <ul className="divide-y">
                    {top.map((t, i) => (
                      <li key={i} className="flex items-center justify-between py-2">
                        <span className="text-sm">{t.question}</span>
                        <span className="text-xs rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                          {t.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">No queries yet.</div>
                )}
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold">Regenerate link?</h2>
            <p className="text-sm text-gray-600">This will replace your current link. The old one will stop working.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  generateShareLink();
                  setShowConfirm(false);
                }}
                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Yes, regenerate
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ----------------------- UI Helpers ----------------------- */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 bg-gray-50">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm break-words">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
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
    "px-2.5 py-1 rounded-full text-xs border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer";
  const active = "bg-black text-white border-black";
  const idle = "bg-white text-black border-gray-300 hover:bg-gray-50";
  return (
    <div className="flex gap-2">
      {["7d", "30d", "all"].map((opt) => (
        <button key={opt} className={`${base} ${value === opt ? active : idle}`} onClick={() => onChange(opt as any)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: "idle" | "processing" | "ready" | "error" }) {
  const styles: Record<typeof status, string> = {
    idle: "bg-gray-100 text-gray-600",
    processing: "bg-yellow-100 text-yellow-900 border border-yellow-300",
    ready: "bg-green-100 text-green-900 border border-green-300",
    error: "bg-red-100 text-red-900 border border-red-300",
  };
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status === "idle" && "Idle"}
      {status === "processing" && "Processing…"}
      {status === "ready" && "Ready"}
      {status === "error" && "Error"}
    </span>
  );
}

function labelFor(r: "7d" | "30d" | "all") {
  if (r === "7d") return "7 days";
  if (r === "30d") return "30 days";
  return "all time";
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UploadPanel() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(""); setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    setMsg(data.ok ? `Indexed ${data.chunks} chunks from ${data.pages} pages` : (data.error || "Upload failed"));
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onUpload} className="space-y-3">
      <Input type="file" name="file" accept="application/pdf" required />
      <Button disabled={busy} type="submit">{busy ? "Uploading..." : "Upload & Index"}</Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </form>
  );
}

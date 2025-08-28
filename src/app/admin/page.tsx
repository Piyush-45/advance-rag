// app/admin/page.tsx (or wherever your upload form lives)
"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState("idle");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch("/api/upload", { method: "POST", body: formData });
    setStatus("processing");
  }

  // Poll status
  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(async () => {
        const res = await fetch("/api/admin/status");
        const { status } = await res.json();
        setStatus(status);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" name="file" accept="application/pdf" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Upload PDF
        </button>
      </form>

      <div className="mt-4 text-sm">
        {status === "idle" && <p>No upload yet.</p>}
        {status === "processing" && <p className="text-yellow-600">⏳ Processing your brochure…</p>}
        {status === "ready" && <p className="text-green-600">✅ Ready! Your VenueBot is updated.</p>}
        {status === "error" && <p className="text-red-600">⚠️ Something went wrong. Try again.</p>}
      </div>
    </main>
  );
}

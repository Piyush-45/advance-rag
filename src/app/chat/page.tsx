// src/app/chat/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I’m VenueBot. Ask me about **capacity, pricing, catering, facilities**, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          token: token || undefined, // public uses token; admin preview can omit
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer ?? "No answer." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Error fetching answer." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-[calc(100vh-3.5rem)] flex flex-col max-w-2xl mx-auto">
      <header className="py-3 border-b text-center font-semibold">💬 VenueBot</header>
      <Card className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
          <div ref={bottomRef} />
        </div>
      </Card>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the venue..." />
        <Button type="submit" disabled={loading || (!token && false /* admin preview allowed */)}>Send</Button>
      </form>
    </main>
  );
}

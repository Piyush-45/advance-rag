// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

function ChatMessage({ role, content }: Message) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ul: (props) => <ul className="list-disc pl-5 space-y-1" {...props} />,
              ol: (props) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
              li: (props) => <li className="marker:text-muted-foreground" {...props} />,
              p: (props) => <p className="mb-2" {...props} />,
              strong: (props) => <strong className="font-semibold" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl px-4 py-3 text-sm shadow-sm">
        <div className="flex items-center gap-2">
          <span>VenueBot is typing</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.2s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-bounce" />
          </span>
        </div>
      </div>
    </div>
  );
}

function QuickReplies({ onPick, disabled }: { onPick: (q: string) => void; disabled: boolean }) {
  const items = [
    "What’s the capacity?",
    "Rough pricing for 300 guests",
    "What facilities are included?",
    "Tell me about packages",
    "Is my date available?",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <Button
          key={t}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onPick(t)}
          className="rounded-full"
        >
          {t}
        </Button>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi there! I’m **VenueBot**. Ask me about **capacity, pricing, facilities, packages,** or **availability**.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, token }),
      });

      if (res.status === 401) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "⚠️ This link might be invalid or expired. Please contact the venue to get a new link.",
          },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? "I couldn’t find that in the documents." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Error fetching answer." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="h-[calc(100vh-3.5rem)] flex flex-col max-w-2xl mx-auto">
      <header className="py-3 border-b text-center font-semibold">💬 VenueBot</header>

      <Card className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </Card>

      {/* Quick replies */}
      <div className="px-4 py-3">
        <QuickReplies onPick={sendMessage} disabled={loading} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the venue..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </Button>
      </form>
    </main>
  );
}

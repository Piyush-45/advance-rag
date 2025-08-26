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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi there! I’m VenueBot. I can help you with venue details like **capacity, pricing, catering, facilities, and more**. What would you like to know first?",
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
    const text = input.trim();
    if (!text) return;

    const newMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newMsg.content }),
      });
      const data = await res.json();
      const answer: Message = { role: "assistant", content: data.answer ?? "No answer." };
      setMessages((m) => [...m, answer]);
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
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
          <div ref={bottomRef} />
        </div>
      </Card>

      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the venue..."
        />
        <Button type="submit" disabled={loading}>
          Send
        </Button>
      </form>
    </main>
  );
}

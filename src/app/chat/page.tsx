"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg: Message = { role: "user", content: input };
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
      const answer: Message = { role: "assistant", content: data.answer };
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

      <Card className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <Avatar><AvatarFallback>VB</AvatarFallback></Avatar>
            )}
            <div
              className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm leading-relaxed shadow-sm
                ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-muted-foreground">Thinking…</p>}
      </Card>

      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the venue..."
        />
        <Button type="submit" disabled={loading}>Send</Button>
      </form>
    </main>
  );
}

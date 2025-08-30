// app/chat/page.tsx
"use client";
// at top of the file with other imports
import type { Components } from "react-markdown";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // optional: if you already have cn helper; otherwise remove and inline classes
import {
  Bot,
  Send,
  Loader2,
  User2,
  Copy,
  Check,
  CornerDownLeft,
  Quote,
  Info,
  ChevronDown,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

/* ----------------------------- Message Bubble ----------------------------- */

function ChatMessage({ role, content }: Message) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full border grid place-items-center bg-background/60 shadow-sm">
          <Bot className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <Markdown content={content} />
        )}
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-full border grid place-items-center bg-background/60 shadow-sm">
          <User2 className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Copy button shows on hover for assistant messages */}
      {!isUser && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 transition-opacity self-start"
          aria-label="Copy message"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

/* --------------------------- Typing / Quick Replies --------------------------- */

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl px-4 py-3 text-sm shadow-sm">
        <div className="inline-flex items-center gap-2">
          <span className="text-muted-foreground">Typing</span>
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

function QuickReplies({
  onPick,
  disabled,
}: {
  onPick: (q: string) => void;
  disabled: boolean;
}) {
  const items = [
    "What’s the capacity?",
    "Rough pricing for 300 guests",
    "What facilities are included?",
    "Tell me about packages",
    "Is my date available?",
  ];
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
      {items.map((t) => (
        <Button
          key={t}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onPick(t)}
          className="rounded-full whitespace-nowrap"
        >
          <Quote className="mr-1.5 h-3.5 w-3.5" />
          {t}
        </Button>
      ))}
    </div>
  );
}

/* ------------------------------ Markdown render ------------------------------ */

// replace your Markdown component with this:

function Markdown({ content }: { content: string }) {
  const components: Components = {
    ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2" {...props} />,
    ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2" {...props} />,
    li: (props) => <li className="marker:text-muted-foreground" {...props} />,
    p: (props) => <p className="mb-2 last:mb-0" {...props} />,
    strong: (props) => <strong className="font-semibold" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="mb-2 rounded-lg border-l-4 border-muted-foreground/30 bg-background/60 p-3 text-muted-foreground"
        {...props}
      />
    ),
    a: (props) => (
      <a
        {...props}
        className="underline underline-offset-4 hover:opacity-80"
        target="_blank"
        rel="noreferrer"
      />
    ),
    table: (props) => (
      <div className="mb-2 overflow-x-auto">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    th: (props) => <th className="border-b p-2 text-left font-medium" {...props} />,
    td: (props) => <td className="border-b p-2 align-top" {...props} />,

    // ✅ Properly typed code renderer; `inline` is now recognized
    code({ inline, className, children, ...props }) {
      if (inline) {
        return (
          <code
            className="rounded-[6px] px-1.5 py-0.5 text-[12px] bg-background/80 border"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <pre className="mb-2 overflow-x-auto rounded-xl border bg-background/80 p-3">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    },
  };

  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>;
}


/* ----------------------------------- Page ----------------------------------- */

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token"));
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length <= 2 ? "instant" as ScrollBehavior : "smooth");
  }, [messages, loading, scrollToBottom]);

  // show “jump to bottom” when user scrolls up
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setAtBottom(nearBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
    if (!loading && input.trim()) sendMessage(input);
  }

  // Enter = send, Shift+Enter = newline
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) sendMessage(input);
    }
  }

  const disabled = loading || !input.trim();

  return (
    <main className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="inline-flex items-center gap-2 text-sm font-semibold">
            <div className="grid h-7 w-7 place-items-center rounded-full border">
              <Bot className="h-4 w-4" />
            </div>
            VenueBot
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Ask about capacity, pricing, facilities, packages, availability
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="relative isolate flex-1 overflow-x-hidden">
        {/* Soft gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_50%_-10%,hsl(var(--primary)/0.12),transparent),radial-gradient(40%_30%_at_110%_10%,hsl(var(--primary)/0.08),transparent)]" />

        {/* 👇 this grid now actually fills remaining height */}
        <div className="mx-auto grid h-full max-w-3xl grid-rows-[1fr_auto_auto]">
          {/* Chat history */}
          <Card className="row-start-1 row-end-2 m-4 mb-2 h-full overflow-hidden border">
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto p-4 md:p-6 space-y-4"
            >
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </Card>

          {/* Quick replies */}
          <div className="mx-4 overflow-x-auto mt-10">
            <QuickReplies onPick={sendMessage} disabled={loading} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="m-4 mt-4 flex items-center gap-2 rounded-xl border bg-background p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about the venue..."
              disabled={loading}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              aria-label="Message"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <CornerDownLeft className="h-4 w-4 md:hidden" />
                  <Send className="hidden h-4 w-4 md:block" />
                  Send
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Jump to bottom */}
        {!atBottom && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="fixed bottom-24 right-6 shadow-md"
          >
            <ChevronDown className="mr-1.5 h-4 w-4" />
            New messages
          </Button>
        )}
      </div>
    </main>
  );
}

// components/ChatMessage.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ role, content }: { role: "user"|"assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm
        ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}
            components={{
              ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="marker:text-muted-foreground" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

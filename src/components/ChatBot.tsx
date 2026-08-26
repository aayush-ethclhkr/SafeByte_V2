import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Shield, Minimize2 } from "lucide-react";
import { getBotResponse, type Message } from "@/hooks/useChatbot";

const SUGGESTED = [
  "What services do you offer?",
  "Tell me about your tools",
  "How do I contact you?",
  "Is there a free consultation?",
];

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi! 👋 I'm the SafeByte assistant. I can answer questions about our services, tools, team, pricing, and more.\n\nWhat can I help you with?",
};

function formatText(text: string) {
  // Convert **bold** and newlines to JSX
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate a natural typing delay
    const delay = 600 + Math.min(trimmed.length * 12, 900);
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: getBotResponse(trimmed),
      };
      setTyping(false);
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((n) => n + 1);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Chat Window ────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}
        aria-label="SafeByte chat assistant"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl border-b border-border/50 bg-card/80 backdrop-blur shrink-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">SafeByte Assistant</p>
            <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block animate-pulse" />
              Online
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
            aria-label="Close chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/60 text-foreground rounded-tl-sm"
                }`}
              >
                {formatText(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions — only show when there's just the welcome msg */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-border/50 bg-card/60 rounded-b-2xl shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={typing}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* ── Floating Toggle Button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span
          className={`absolute transition-all duration-200 ${open ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        >
          <X className="h-6 w-6" />
        </span>
        <span
          className={`absolute transition-all duration-200 ${open ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
        >
          <MessageCircle className="h-6 w-6" />
        </span>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}

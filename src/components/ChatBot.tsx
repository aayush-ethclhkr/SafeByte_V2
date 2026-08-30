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
  text: "SafeByte Cyber Defense AI Assistant initialized.\n\nI can provide real-time details on our **Penetration Testing**, **Adversary Simulation**, **CryptoTrace Intelligence**, **Incident Response SLAs**, and **Scoping consultations**.\n\nHow can I assist your security team?",
};

function formatText(text: string) {
  // Convert **bold** and newlines to JSX
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-primary font-semibold">{part}</strong> : part
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
    const delay = 500 + Math.min(trimmed.length * 10, 800);
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
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "min(580px, calc(100vh - 120px))" }}
        aria-label="SafeByte cyber defense assistant"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-t-2xl border-b border-border bg-muted/50 backdrop-blur shrink-0">
          <div className="relative h-9 w-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-foreground font-mono leading-none">SAFEBYTE DEFENSE AI</p>
            </div>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse" />
              SOC SECURE PROTOCOL ACTIVE
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
            aria-label="Close chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mr-2 mt-0.5 text-primary">
                  <Shield className="h-3 w-3" />
                </div>
              )}
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                    : "bg-muted/80 border border-border text-foreground/90 rounded-tl-xs font-sans shadow-sm"
                }`}
              >
                {formatText(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mr-2 mt-0.5 text-primary">
                <Shield className="h-3 w-3" />
              </div>
              <div className="bg-muted/80 border border-border rounded-xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[11px] px-2.5 py-1 rounded-md border border-border bg-muted/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-3.5 py-3 border-t border-border bg-muted/30 rounded-b-2xl shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a security inquiry..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
            disabled={typing}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-[0_0_10px_hsl(var(--primary)/0.3)] shrink-0"
            aria-label="Send message"
          >
            <Send className="h-3 w-3" />
          </button>
        </form>
      </div>

      {/* ── Floating Toggle Button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-13 w-13 sm:h-14 sm:w-14 rounded-xl bg-primary text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.6)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border border-primary-foreground/20"
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
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}

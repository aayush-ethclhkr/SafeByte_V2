import { useState, useRef } from "react";
import { Mail, MapPin, Send, Shield, AlertOctagon, CheckCircle2, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_AUTOREPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

const scopeOptions = [
  "Offensive Penetration Testing (Web/API/Mobile)",
  "AI Red Teaming & Adversary Emulation",
  "CryptoTrace & Smart Contract Audit",
  "Digital Forensics & Incident Response (DFIR)",
  "Cloud Architecture & IAM Hardening",
  "General Security Consultation",
];

export default function Contact() {
  const [sending, setSending] = useState(false);
  const [selectedScope, setSelectedScope] = useState(scopeOptions[0]);
  const [isEmergency, setIsEmergency] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setSending(true);

    try {
      const formData = new FormData(formRef.current);
      const messageContent = `[SCOPE: ${selectedScope}] [URGENCY: ${isEmergency ? "CRITICAL EMERGENCY" : "STANDARD"}]\n\n${formData.get("message")}`;

      const templateParams = {
        from_name: formData.get("from_name"),
        from_email: formData.get("from_email"),
        organization: formData.get("organization") || "Not specified",
        message: messageContent,
      };

      // Send notification to SafeByte team
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );

      // Send auto-reply to the user
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTOREPLY_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast.success("Security scoping request submitted. Our engineers will respond within 24 hours.");
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to transmit message. Please contact us directly at team.safebyte@gmail.com or call +91 89238 17932.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      {/* ── Header Section ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4 animate-fade-up">
            <Lock className="h-3.5 w-3.5" /> CONFIDENTIAL SCOPING &amp; TRIAGE
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Initiate a Technical Assessment or Emergency Incident Triage
          </h1>
          <p
            className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            All communications are encrypted and covered under standard mutual non-disclosure agreements. An OSCP-certified security engineer will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* ── Main Form & Operations Grid ─────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <ScrollReveal>
                <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur-md">
                  {/* Emergency Toggle Banner */}
                  <div className="mb-6 p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${isEmergency ? "bg-red-500/20 text-red-400" : "bg-primary/10 text-primary"}`}>
                        {isEmergency ? <AlertOctagon className="h-5 w-5 animate-pulse" /> : <Shield className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-foreground">
                          {isEmergency ? "ACTIVE BREACH EMERGENCY" : "SCHEDULED ASSESSMENT"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isEmergency ? "Prioritizes immediate < 15-min incident triage" : "Standard scoping response within 24 hours"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEmergency(!isEmergency)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isEmergency
                          ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          : "border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isEmergency ? "Active (Emergency)" : "Toggle Emergency"}
                    </button>
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    {/* Primary Engagement Scope Selector */}
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block font-semibold">
                        Primary Engagement Objective
                      </label>
                      <select
                        value={selectedScope}
                        onChange={(e) => setSelectedScope(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg border border-border bg-card text-xs font-mono text-foreground focus:border-primary/60 outline-none transition-colors"
                      >
                        {scopeOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-card text-foreground">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">
                          Name *
                        </label>
                        <Input
                          name="from_name"
                          placeholder="Dr. Alex Rivera"
                          required
                          className="bg-card border-border focus:border-primary/60 h-11 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">
                          Corporate Email *
                        </label>
                        <Input
                          name="from_email"
                          type="email"
                          placeholder="alex@organization.com"
                          required
                          className="bg-card border-border focus:border-primary/60 h-11 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">
                        Organization / Target Domain
                      </label>
                      <Input
                        name="organization"
                        placeholder="Company Name or target.com"
                        className="bg-card border-border focus:border-primary/60 h-11 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block font-semibold">
                        Scope &amp; Technical Requirements *
                      </label>
                      <Textarea
                        name="message"
                        placeholder="Detail target scope (IP ranges, domain count, API endpoints), timeline constraints, compliance frameworks (NIST, ISO, OWASP), or active breach symptoms..."
                        required
                        rows={5}
                        className="bg-card border-border focus:border-primary/60 text-xs resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={sending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Transmitting Encrypted Request..." : "Submit Scoping Request"}
                    </Button>
                  </form>
                </div>
              </ScrollReveal>
            </div>

            {/* Direct Operations & Hotline Column */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal delay={150}>


                {/* Direct Operational Channels */}
                <div className="p-6 rounded-2xl border border-border bg-card/90 space-y-5 shadow-sm">
                  <div className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
                    Direct Contact Channels
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Encrypted Dispatch Email</div>
                        <a href="mailto:team.safebyte@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                          team.safebyte@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Cyber Defense Headquarters</div>
                        <div className="text-muted-foreground">Meerut, Uttar Pradesh, India</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-2 text-[11px] font-mono text-muted-foreground">
                    <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mutual NDA automatically provided
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="h-3.5 w-3.5 text-primary" /> PGP Public Key available upon request
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

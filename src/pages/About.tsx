import { Shield, Target, Eye, Users, Award, Terminal, Lock, CheckCircle2, Cpu, UserCheck } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import TiltCard from "@/components/TiltCard";

const teamMembers = [
  {
    name: "Aayush Upadhyay",
    role: "Founder & Lead Security Researcher",
    credentials: ["CEH", "CPENT"],
    bio: "Offensive security practitioner specializing in system penetration testing, complex exploit chain weaponization, and binary analysis. Author of proprietary auditing frameworks and crypto tracing algorithms.",
    areas: ["System Pentesting", "Exploit Development", "Active Directory Defense", "Smart Contract Security"],
  },
  {
    name: "Piyush Dhariwal",
    role: "Founder & Web Security Expert",
    credentials: ["NASA P1"],
    bio: "Web application security specialist with a NASA P1 bug bounty to his name. Expert in uncovering critical web vulnerabilities across high-value targets including government and aerospace infrastructure.",
    areas: ["Web Application Security", "Bug Bounty", "API Security", "Vulnerability Research"],
  },
];

const pillars = [
  {
    icon: Target,
    title: "100% Manual Exploitation",
    desc: "Automated scanners miss critical business logic flaws and flood reports with false positives. Every vulnerability we report is manually proven with deterministic proof-of-concept exploits.",
  },
  {
    icon: Shield,
    title: "Zero-Bullshit Technical Integrity",
    desc: "We write direct, concise engineering advisories with actionable patch diffs for developers and clear financial risk context for executive leadership.",
  },
  {
    icon: Lock,
    title: "Strict Confidentiality & Mutual NDA",
    desc: "Client findings and source material are handled in access-controlled workspaces with agreed retention periods and clear deletion procedures.",
  },
  {
    icon: Eye,
    title: "Continuous Research & Open Tooling",
    desc: "We contribute back to the cybersecurity community through proprietary and open tools like CryptoTrace AI, local malware sandboxes, and CVE exposure analyzers.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      {/* ── Header Section ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4 animate-fade-up">
            <Shield className="h-3.5 w-3.5" /> SECURITY ENGINEERING CULTURE
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            A Founder-Led Security Lab, Built From the Ground Up
          </h1>
          <p
            className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            SafeByte was founded in 2024 by two security practitioners with a shared goal: make careful, manual security research more accessible to startups and growing technical teams.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-card/30">
        <div className="container py-8">
          <div className="grid sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border max-w-4xl mx-auto">
            {[
              { value: "2024", label: "SafeByte founded" },
              { value: "2", label: "Hands-on founders" },
              { value: "3", label: "Early clients served" },
            ].map((item) => (
              <div key={item.label} className="bg-background/95 px-6 py-6 text-center">
                <div className="font-mono text-2xl font-bold text-primary">{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            We are intentionally small. Client work is handled directly by the founders, and client identities remain private unless permission to publish is explicitly granted.
          </p>
        </div>
      </section>
      {/* ── Mission & Engineering Philosophy ─────────────────────────────── */}
      <section className="py-20 border-b border-border bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="space-y-4">
                <div className="text-xs font-mono text-primary uppercase tracking-widest">
                  Our Engineering Doctrine
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Automated Scanning Is a Starting Point, Not the Answer.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Modern threat actors don't run generic vulnerability scanners and walk away. They reverse-engineer proprietary APIs, chain seemingly harmless info disclosures into remote code execution, and manipulate distributed blockchain state.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SafeByte adds the human reasoning that automated tools cannot provide. Every engagement is scoped carefully, tested responsibly, and translated into fixes a product team can actually ship.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card/90 space-y-4 font-mono text-xs shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-border/60 text-primary font-bold">
                  <Terminal className="h-4 w-4" /> SAFEBYTE CODE OF ETHICS
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Never cause unplanned service disruption or production data corruption.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Every vulnerability disclosed includes actionable, developer-ready code fixes.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>100% free retesting within 30 days of patch deployment.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Zero disclosure to third parties without explicit written client consent.</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Engineering Team & Verified Credentials ──────────────────────── */}
      <section className="py-24">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
                Certified Practitioners
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Security Leadership &amp; Researchers
              </h2>
              <p className="text-sm text-muted-foreground">
                Meet the two founders building SafeByte, conducting its research, and working directly with every early client.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((tm, idx) => (
              <ScrollReveal key={tm.name} delay={idx * 100}>
                <TiltCard className="p-7 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-lg">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{tm.name}</h3>
                        <p className="text-xs text-primary font-mono">{tm.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tm.credentials.map((cred) => (
                        <span
                          key={cred}
                          className="px-2 py-0.5 rounded bg-muted border border-border text-xs font-mono font-bold text-foreground"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                      {tm.bio}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-border/60">
                      <div className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">
                        Core Expertise:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tm.areas.map((area) => (
                          <span
                            key={area}
                            className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars of Excellence ────────────────────────────────────────── */}
      <section className="py-24 border-t border-border bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
                Core Foundations
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                How We Deliver Defensible Security
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 80}>
                <div className="p-6 rounded-xl border border-border bg-card/80 flex flex-col justify-between h-full hover:border-primary/30 transition-colors shadow-sm">
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{p.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

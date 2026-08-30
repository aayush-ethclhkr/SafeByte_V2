import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Search,
  Server,
  Bot,
  Eye,
  ChevronRight,
  ArrowRight,
  Bitcoin,
  CheckCircle2,
  Terminal as TerminalIcon,
  Key,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import NetworkTopologyCanvas from "@/components/NetworkTopologyCanvas";
import TiltCard from "@/components/TiltCard";
import { useAuth } from "@/context/AuthContext";

// Core Capabilities Data
const capabilities = [
  {
    icon: Search,
    title: "Offensive Penetration Testing",
    code: "CAP-01",
    tag: "MANUAL EXPLOITATION",
    desc: "Simulate advanced persistent threats across Web, API, Mobile, and Hybrid Infrastructure. We eliminate automated false positives through manual exploitation, privilege escalation, and business logic bypasses.",
    deliverables: ["Step-by-step exploit reproduction", "CVSS v3.1 + EPSS risk score", "Direct developer patch guidance"],
    mitre: "Initial Access · Execution · Defense Evasion",
    link: "/contact",
    linkLabel: "Request Scope",
  },
  {
    icon: Bot,
    title: "Autonomous AI Red Teaming",
    code: "CAP-02",
    tag: "ADVERSARY SIMULATION",
    desc: "Continuous adversarial simulation testing multi-stage attack chains. Stress-test SOC detection engineering, SIEM correlation rules, and endpoint detection response against novel zero-day techniques.",
    deliverables: ["Detection efficacy score", "MITRE ATT&CK coverage heatmap", "Blue team resilience debrief"],
    mitre: "Persistence · Lateral Movement · Exfiltration",
    link: "/contact",
    linkLabel: "Request Scope",
  },
  {
    icon: Bitcoin,
    title: "CryptoTrace Blockchain Intelligence",
    code: "CAP-03",
    tag: "WEB3 & DEFI AUDITS",
    desc: "Heuristic multi-chain transaction tracing, smart contract vulnerability triaging, and OFAC high-risk darknet wallet mapping across 7 blockchain networks with real-time risk scoring.",
    deliverables: ["Forensic wallet attribution", "Smart contract audit report", "AML/OFAC compliance dossier"],
    mitre: "Financial Integrity · Smart Contract Logic",
    link: "/contact",
    linkLabel: "Request Scope",
  },
  {
    icon: Eye,
    title: "FraudEye Scanner",
    code: "CAP-04",
    tag: "AI FRAUD PREVENTION",
    desc: "Three-in-one fraud detection — UPI QR payment scam detection, deepfake voice anomaly analysis using Web Audio API, and phishing URL reputation checks via VirusTotal. Runs entirely in your browser.",
    deliverables: ["UPI scam mode detection", "Deepfake voice suspicion score", "URL phishing & injection analysis"],
    mitre: "Fraud Detection · Social Engineering",
    link: "/tools/fraud-scanner",
    linkLabel: "Launch Tool",
  },
  {
    icon: Server,
    title: "System Auditing Tools",
    code: "CAP-05",
    tag: "DESKTOP SECURITY",
    desc: "Three standalone desktop applications for system-level security auditing — a file system crawler with VirusTotal scanning, a real-time USB device monitor, and full CryptoTrace AI desktop suite.",
    deliverables: ["File system malware scan with CSV export", "Real-time USB event logging", "CryptoTrace AI desktop with PDF reports"],
    mitre: "Host Audit · Device Monitoring · Forensics",
    link: "/tools",
    linkLabel: "View Tools",
  },
  {
    icon: Key,
    title: "Offline Password Manager",
    code: "CAP-06",
    tag: "LOCAL VAULT",
    desc: "A fully offline credential vault protected by PBKDF2-HMAC-SHA256 key derivation, Fernet AES-128 encryption, and Google Authenticator-compatible TOTP 2FA. No cloud, no server, no leakage.",
    deliverables: ["Encrypted SQLite vault storage", "TOTP two-factor authentication", "Strong password generator + export"],
    mitre: "Credential Security · Access Control",
    link: "/tools",
    linkLabel: "Download Tool",
  },
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── SECTION 1: HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-border">
        <div className="absolute inset-0 cyber-grid opacity-70 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.07] blur-[120px] pointer-events-none rounded-full" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="tracking-wide">THREAT SURFACE DEFENSE ACTIVE · 24/7 SOC</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.08] text-foreground animate-fade-up"
                style={{ animationDelay: "100ms" }}
              >
                We Find the Vulnerabilities{" "}
                <span className="text-primary text-glow-cyan">Adversaries Exploit First.</span>
              </h1>

              <p
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                SafeByte delivers elite offensive penetration testing, continuous red teaming, and rapid breach triage.
                Engineered for enterprises where a single exploit is not an option.
              </p>

              <div
                className="flex flex-wrap items-center gap-4 pt-2 animate-fade-up"
                style={{ animationDelay: "300ms" }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.5)] transition-all gap-2"
                  asChild
                >
                  <Link to="/contact">
                    Book a Security Assessment <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-card/80 hover:bg-muted/80 text-foreground font-mono text-xs hover:border-primary/40 transition-all gap-2 shadow-sm"
                  asChild
                >
                  <Link to="/services">
                    <TerminalIcon className="h-3.5 w-3.5 text-primary" /> Explore Capabilities
                  </Link>
                </Button>
              </div>

              <div
                className="pt-6 border-t border-border grid grid-cols-3 gap-4 animate-fade-up"
                style={{ animationDelay: "400ms" }}
              >
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground text-glow-cyan">100%</div>
                  <div className="text-[11px] text-muted-foreground">Manual Exploit Validation</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-primary">&lt; 15 min</div>
                  <div className="text-[11px] text-muted-foreground">Incident Response SLA</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">Zero</div>
                  <div className="text-[11px] text-muted-foreground">False-Positive Guarantee</div>
                </div>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <NetworkTopologyCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: CORE CAPABILITIES MATRIX ─────────────────────────────── */}
      <section className="py-24 md:py-32 relative">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-widest uppercase mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Offensive &amp; Defensive Engineering
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  Enterprise Security Capabilities
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Every engagement is staffed exclusively by certified security engineers utilizing deterministic adversary emulation and zero automated fluff.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <ScrollReveal key={cap.title} delay={i * 80}>
                <TiltCard className="h-full p-6 sm:p-7 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                        <cap.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {cap.tag}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-muted-foreground/60 mb-1">{cap.code}</div>
                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                      {cap.desc}
                    </p>

                    <div className="space-y-1.5 pt-4 border-t border-border/60 mb-6">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 mb-2">
                        Key Deliverables:
                      </div>
                      {cap.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-foreground/80 font-sans">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[170px]">
                      {cap.mitre}
                    </span>
                    <Link
                      to={cap.link}
                      className="font-mono text-primary font-semibold hover:underline flex items-center gap-1 shrink-0"
                    >
                      {cap.linkLabel} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>



      {/* ── SECTION 4: SECURITY TOOLS SUITE ─────────────────────────────────── */}
      <section className="py-24 md:py-32 relative">
        <div className="container">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-widest uppercase mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  In-House Technology
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  The SafeByte Security Suite
                </h2>
              </div>
              <Button variant="outline" className="border-border font-mono text-xs shadow-sm" asChild>
                <Link to="/tools">
                  Explore Full Tools Directory <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Bitcoin,
                name: "CryptoTrace AI",
                tag: "BLOCKCHAIN INTEL",
                route: "/tools/crypto-trace",
                desc: "Trace any wallet across 7 chains. Balance lookups, OFAC sanction checks, and heuristic risk scoring.",
              },
              {
                icon: Eye,
                name: "Malware Detector",
                tag: "BROWSER SANDBOX",
                route: "/tools/malware-scanner",
                desc: "Client-side static analysis, MD5/SHA-256 hashing, VirusTotal lookup, and Windows PE structure inspection.",
              },
              {
                icon: Search,
                name: "Vulnerability Scanner",
                tag: "CVE + EPSS MATRIX",
                route: "/tools/vuln-scanner",
                desc: "Scan your software stack against 240k+ CVEs with real-world EPSS weaponization probabilities.",
              },
              {
                icon: Shield,
                name: "FraudEye Scanner",
                tag: "AI FRAUD PREVENTION",
                route: "/tools/fraud-scanner",
                desc: "UPI QR code scam detector, deepfake voice anomaly identification, and phishing URL analyzer.",
              },
            ].map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 60}>
                <TiltCard className="p-5 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                        <t.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">
                        {t.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {t.desc}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary/15 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 transition-all text-xs"
                    onClick={() => user ? navigate(t.route) : navigate("/login")}
                  >
                    {!user && <Lock className="h-3 w-3 mr-1" />}
                    Launch Tool
                  </Button>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-background to-muted/40 relative overflow-hidden">
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
              <Shield className="h-3.5 w-3.5" /> FREE INITIAL THREAT SCOPING CALL
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Ready to Discover Your Real Attack Surface?
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              Speak directly with an OSCP-certified security engineer. We will review your target scope, regulatory requirements, and deliver a tailored testing plan within 24 hours.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-[0_0_25px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.5)] transition-all"
                asChild
              >
                <Link to="/contact">Request Engagement Scoping</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-card/80 hover:bg-muted/80 text-foreground font-mono text-xs shadow-sm"
                asChild
              >
                <Link to="/services">View Services</Link>
              </Button>
            </div>

            <div className="mt-8 text-xs font-mono text-muted-foreground flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Mutual NDA Included
              </span>
              <span>&bull;</span>
              <span>100% Confidential</span>
              <span>&bull;</span>
              <span>Zero Commitment</span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

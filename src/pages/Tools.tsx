import { Lock, Bug, Search, HardDrive, Usb, Download, Zap, Eye, Bitcoin, Terminal, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import TiltCard from "@/components/TiltCard";

const tools = [
  {
    icon: Bitcoin,
    name: "CryptoTrace AI",
    category: "WEB ENGINE",
    desc: "Heuristic multi-chain blockchain intelligence engine. Real-time balance and transaction indexing, high-risk darknet/OFAC wallet registry cross-checks, and automated risk scoring across 7 major networks. Operates 100% in your browser without data exfiltration.",
    version: "v1.0.0",
    platform: "Client-Side Browser · Zero Install",
    webTool: "/tools/crypto-trace",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
    badge: "LIVE INTELLIGENCE",
  },
  {
    icon: Bug,
    name: "Malware Detector & Sandbox",
    category: "WEB ENGINE",
    desc: "Instant client-side static binary analysis. Computes MD5/SHA-256 hashes, queries VirusTotal reputation intelligence, extracts suspicious strings, and inspects Windows Portable Executable (PE) headers for dangerous API import signatures.",
    version: "v1.0.1",
    platform: "Client-Side Browser · Zero Install",
    webTool: "/tools/malware-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
    badge: "STATIC ANALYSIS",
  },
  {
    icon: Search,
    name: "Vulnerability Exposure Scanner",
    category: "WEB ENGINE",
    desc: "Scan your complete technology stack against 240,000+ known CVEs with real-world Exploit Prediction Scoring (EPSS). Calculates an Attack Surface Score (0–100) and outputs a prioritized CVSS × EPSS remediation roadmap.",
    version: "v1.0.1",
    platform: "Client-Side Browser · Zero Install",
    webTool: "/tools/vuln-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
    badge: "EPSS TELEMETRY",
  },
  {
    icon: Eye,
    name: "FraudEye Multi-Vector Scanner",
    category: "WEB ENGINE",
    desc: "Multi-modal AI fraud detection with three specialized modes: UPI QR Code Scam Inspector (detects forced mode=02 payment requests), Deepfake Voice Detector (audio anomaly analysis), and URL Phishing Analyzer with 3,955 attack signatures.",
    version: "v1.0.1",
    platform: "Client-Side Browser · Zero Install",
    webTool: "/tools/fraud-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
    badge: "ANTI-FRAUD AI",
  },
  {
    icon: Lock,
    name: "SafeByte Password Vault",
    category: "STANDALONE DESKTOP",
    desc: "Zero-knowledge credential vault protected by PBKDF2-HMAC-SHA256 master key derivation + Time-Based One-Time Passwords (TOTP). Fernet-encrypted SQLite vault where the master key is never written to disk. Standalone GUI application for macOS and Windows.",
    version: "v2.0.0",
    platform: "macOS · Windows Desktop",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-Password-Manager-macOS.zip",
    windowsUrl: "/downloads/SafeByte-Password-Manager-Windows.exe",
    guideUrl: "/downloads/password_manager_user_guide.pdf",
    badge: "ENCRYPTED VAULT",
  },
  {
    icon: HardDrive,
    name: "File System Crawler & Heuristic Scanner",
    category: "STANDALONE DESKTOP",
    desc: "Deep directory auditor that crawls local disks, hashes all files, and flags malicious persistence mechanisms, hidden scripts, and suspicious extensions. Features live progress reporting and CSV/TXT incident export.",
    version: "v2.0.0",
    platform: "macOS · Windows Desktop",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-File-Crawler-macOS.zip",
    windowsUrl: "/downloads/SafeByte-File-Crawler-Windows.exe",
    guideUrl: "/downloads/file_lister_user_guide.pdf",
    badge: "LOCAL AUDITOR",
  },
  {
    icon: Usb,
    name: "USB Peripheral Hardware Monitor",
    category: "STANDALONE DESKTOP",
    desc: "Real-time background monitor that detects USB devices the instant they connect or disconnect. Logs Vendor ID, Product ID, serial numbers, and device descriptions with audio and native OS alerts to prevent BadUSB attacks.",
    version: "v2.0.0",
    platform: "macOS · Windows Desktop",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-USB-Monitor-macOS.zip",
    windowsUrl: "/downloads/SafeByte-USB-Monitor-Windows.exe",
    guideUrl: null,
    badge: "HARDWARE SENTRY",
  },
];

const webEngines = tools.filter((t) => t.webTool !== null);
const desktopTools = tools.filter((t) => t.webTool === null);

export default function Tools() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      {/* ── Header Section ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4 animate-fade-up">
            <Terminal className="h-3.5 w-3.5" /> PROPRIETARY RESEARCH TOOLING
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Specialized Tooling Engineered for Offensive &amp; Defensive Precision
          </h1>
          <p
            className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Every tool in the SafeByte suite is designed in-house by our threat researchers to perform rapid triage, malware analysis, multi-chain intelligence, and endpoint inspection.
          </p>
        </div>
      </section>

      {/* ── Web-Based Scanning Engines ───────────────────────────────────── */}
      <section className="py-20">
        <div className="container space-y-8">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="text-xs font-mono text-primary uppercase tracking-widest">
                  Category 01
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Browser-Based Security Engines
                </h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                Zero Installation · 100% Client-Side Privacy
              </span>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {webEngines.map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 80}>
                <TiltCard className="p-6 sm:p-7 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                        <t.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {t.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {t.name}
                      </h3>
                      <span className="text-xs font-mono text-primary font-semibold">{t.version}</span>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono mb-4">{t.platform}</p>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                      {t.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 shadow-md" asChild>
                      <Link to={t.webTool!}>
                        <Zap className="h-3.5 w-3.5" /> Launch {t.name}
                      </Link>
                    </Button>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Standalone Desktop Auditing Apps ──────────────────────────────── */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="container space-y-8">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="text-xs font-mono text-primary uppercase tracking-widest">
                  Category 02
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Standalone System Auditing Applications
                </h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                macOS &amp; Windows Desktop Executables
              </span>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {desktopTools.map((t, idx) => (
              <ScrollReveal key={t.name} delay={idx * 60}>
                <div className="p-6 sm:p-7 rounded-2xl border border-border bg-card/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-colors shadow-sm">
                  <div className="flex items-start gap-4 max-w-2xl">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-foreground">{t.name}</h3>
                        <span className="text-xs font-mono text-primary font-semibold">{t.version}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">&bull; {t.platform}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                    {t.downloadUrl ? (
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 shadow-sm" asChild>
                        <a href={t.downloadUrl} download>
                          <Download className="h-3.5 w-3.5" /> macOS (.zip)
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="opacity-40 text-xs">
                        <Download className="h-3.5 w-3.5" /> macOS
                      </Button>
                    )}

                    {t.windowsUrl ? (
                      <Button size="sm" variant="outline" className="border-border bg-card hover:bg-muted text-xs gap-1.5 shadow-sm" asChild>
                        <a href={t.windowsUrl} download>
                          <Download className="h-3.5 w-3.5" /> Windows (.exe)
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="opacity-40 text-xs">
                        <Download className="h-3.5 w-3.5" /> Windows
                      </Button>
                    )}

                    {t.guideUrl && (
                      <></>
                    )}
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

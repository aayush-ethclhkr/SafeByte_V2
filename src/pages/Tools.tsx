import { Lock, Bug, Search, HardDrive, Usb, Download, BookOpen, Zap, Eye, Bitcoin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const tools = [
  {
    icon: Lock,
    name: "Password Manager",
    desc: "Securely store, retrieve, and generate credentials with two-factor protection — Master Password (PBKDF2-HMAC-SHA256) + TOTP (Google Authenticator). Fernet-encrypted SQLite vault. The encryption key is never stored in plaintext. GUI-based, no installation needed beyond the app.",
    version: "v2.0.0",
    platform: "macOS · Windows",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-Password-Manager-macOS.zip",
    windowsUrl: "/downloads/SafeByte-Password-Manager-Windows.exe",
    guideUrl: "/downloads/password_manager_user_guide.pdf",
  },
  {
    icon: Bug,
    name: "Malware Detector",
    desc: "Upload any file for instant static analysis — MD5/SHA-256 hashing, VirusTotal reputation lookup, suspicious string extraction, and Windows PE structure analysis with dangerous API detection. Runs entirely in your browser, no file leaves your device.",
    version: "v1.0.1",
    platform: "Browser · No install needed",
    webTool: "/tools/malware-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
  },
  {
    icon: Search,
    name: "Vulnerability Assessment Tool",
    desc: "Scan your entire software stack for known CVEs with real exploitation probability scores (EPSS). Get a 0–100 Attack Surface Score, plain-English risk explanations, and a fix priority roadmap — sorted by CVSS × EPSS combined score. Powered by NVD + FIRST.org.",
    version: "v1.0.1",
    platform: "Browser · No install needed",
    webTool: "/tools/vuln-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
  },
  {
    icon: HardDrive,
    name: "File System Crawler",
    desc: "Scan any directory for malware and suspicious files. MD5/SHA256 hashes every file, checks against VirusTotal's 70+ antivirus engines, and flags threats using local heuristics — dangerous filenames, suspicious extensions, persistence locations. Live results table with SAFE/SUSPICIOUS/MALICIOUS verdicts. Export to CSV or TXT.",
    version: "v2.0.0",
    platform: "macOS · Windows",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-File-Crawler-macOS.zip",
    windowsUrl: "/downloads/SafeByte-File-Crawler-Windows.exe",
    guideUrl: "/downloads/file_lister_user_guide.pdf",
  },
  {
    icon: Usb,
    name: "USB Detection Tool",
    desc: "Real-time background monitor that detects any USB or external device the moment it is physically connected or disconnected. Plays a beep alert, sends a native macOS notification, and logs every event (timestamp, device name, vendor ID, product ID, serial) to a live table. Runs silently in the system tray. Export events to CSV anytime.",
    version: "v2.0.0",
    platform: "macOS · Windows",
    webTool: null,
    downloadUrl: "/downloads/SafeByte-USB-Monitor-macOS.zip",
    windowsUrl: "/downloads/SafeByte-USB-Monitor-Windows.exe",
    guideUrl: null,
  },

  {
    icon: Eye,
    name: "FraudEye Scanner",
    desc: "AI-powered fraud detection with three scanning modes: QR Code Scanner (detects UPI payment request scams with mode=02 detection), Voice Fraud Detector (identifies AI-generated deepfake voice calls), and URL Safety Checker (pattern matching against 3,955 attack signatures + VirusTotal verification). Protect yourself before you lose money.",
    version: "v1.0.1",
    platform: "Browser · No install needed",
    webTool: "/tools/fraud-scanner",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
  },
  {
    icon: Bitcoin,
    name: "CryptoTrace AI",
    desc: "Trace any blockchain wallet across 7 networks — live balance lookup, full transaction intelligence (volume, wallet age, incoming/outgoing), a 0–100 risk score using balance tiers and tx volume, and cross-referencing against a curated high-risk registry of OFAC-sanctioned and darknet-linked addresses. Powered by Etherscan, Blockchain.info, and TronGrid. No data leaves your browser.",
    version: "v1.0.0",
    platform: "Browser · No install needed",
    webTool: "/tools/crypto-trace",
    downloadUrl: null,
    windowsUrl: null,
    guideUrl: null,
    isCrypto: true,
  },
];

const desktopTools = tools.filter(t => !t.webTool);
const cryptoTool   = tools.filter(t => t.webTool && (t as { isCrypto?: boolean }).isCrypto);
const webTools     = tools.filter(t => t.webTool && !(t as { isCrypto?: boolean }).isCrypto);

const Tools = () => (
  <div className="min-h-screen pt-24">
    <section className="py-20 md:py-28">
      <div className="container max-w-3xl">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4 animate-fade-up">Tools Suite</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Purpose-built security tools
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
          Each tool in our suite is developed in-house by our research team, battle-tested in enterprise environments, and continuously updated against emerging threats.
        </p>
      </div>
    </section>

    <section className="pb-16">
      <div className="container">

        {/* ── System Auditing Tools ────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-mono text-primary uppercase tracking-widest">System Auditing Tools</span>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">Standalone apps · macOS &amp; Windows</span>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-4 mb-14">
          {desktopTools.map((tool, i) => (
            <ScrollReveal key={tool.name} delay={i * 60}>
              <div className="group flex items-start gap-6 p-5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300">
                {/* Icon */}
                <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors mt-0.5">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <span className="text-xs font-mono text-primary">{tool.version}</span>
                    <span className="text-xs text-muted-foreground hidden md:inline">· {tool.platform}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {tool.downloadUrl ? (
                      <Button size="sm" className="gap-1.5" asChild>
                        <a href={tool.downloadUrl} download>
                          <Download className="h-3.5 w-3.5" />
                          macOS
                          <span className="text-[9px] bg-primary-foreground/20 px-1 py-0.5 rounded">Apple</span>
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1.5 opacity-40" disabled>
                        <Download className="h-3.5 w-3.5" />
                        macOS
                        <span className="text-[9px] bg-muted/30 px-1 py-0.5 rounded">Apple</span>
                      </Button>
                    )}

                    {tool.windowsUrl ? (
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <a href={tool.windowsUrl} download>
                          <Download className="h-3.5 w-3.5" />
                          Windows
                          <span className="text-[9px] bg-muted/30 px-1 py-0.5 rounded">.exe</span>
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 opacity-40" disabled title="Windows version coming soon">
                        <Download className="h-3.5 w-3.5" />
                        Windows
                        <span className="text-[9px] bg-muted/30 px-1 py-0.5 rounded">Soon</span>
                      </Button>
                    )}

                    {tool.guideUrl ? (
                      <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" asChild>
                        <a href={tool.guideUrl} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="h-3.5 w-3.5" /> User Guide
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground opacity-40" disabled>
                        <BookOpen className="h-3.5 w-3.5" /> User Guide
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── CryptoTrace AI ───────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-mono text-primary uppercase tracking-widest">CryptoTrace AI</span>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">Blockchain intelligence · No install needed</span>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-4 mb-14">
          {cryptoTool.map((tool, i) => (
            <ScrollReveal key={tool.name} delay={i * 60}>
              <div className="group flex items-center gap-6 p-5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">WEB</span>
                    <span className="text-xs font-mono text-primary">{tool.version}</span>
                    <span className="text-xs text-muted-foreground hidden md:inline">· {tool.platform}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>
                <div className="shrink-0">
                  <Button size="sm" className="gap-1.5 whitespace-nowrap" asChild>
                    <Link to={tool.webTool!}>
                      <Zap className="h-3.5 w-3.5" /> Launch Tool
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Web-based tools ─────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Web Tools</span>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">Runs in your browser · No install needed</span>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-4 pb-24">
          {webTools.map((tool, i) => (
            <ScrollReveal key={tool.name} delay={i * 60}>
              <div className="group flex items-center gap-6 p-5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300">
                {/* Icon */}
                <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground">{tool.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">WEB</span>
                    <span className="text-xs font-mono text-primary">{tool.version}</span>
                    <span className="text-xs text-muted-foreground hidden md:inline">· {tool.platform}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  <Button size="sm" className="gap-1.5 whitespace-nowrap" asChild>
                    <Link to={tool.webTool!}>
                      <Zap className="h-3.5 w-3.5" /> Launch Tool
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  </div>
);

export default Tools;

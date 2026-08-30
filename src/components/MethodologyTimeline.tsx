import { useState } from "react";
import { Search, Terminal, FileSpreadsheet, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface Phase {
  step: string;
  title: string;
  subtitle: string;
  icon: typeof Search;
  duration: string;
  deliverable: string;
  activities: string[];
  tooling: string[];
  mitreCoverage: string;
}

const phases: Phase[] = [
  {
    step: "01",
    title: "Reconnaissance & Attack Surface Mapping",
    subtitle: "Passive OSINT, port discovery, and perimeter indexing",
    icon: Search,
    duration: "Day 1–3",
    deliverable: "Attack Surface & Exposure Matrix",
    activities: [
      "Non-intrusive DNS brute-forcing & subdomain enumeration",
      "Perimeter network mapping & exposed service profiling",
      "Leaked credential & darknet repo credential correlation",
      "Cloud asset indexing across AWS/Azure/GCP public endpoints",
    ],
    tooling: ["Amass", "Shodan Enterprise API", "Nmap NSE", "Custom SafeByte Crawlers"],
    mitreCoverage: "Reconnaissance (TA0043) · Resource Development (TA0042)",
  },
  {
    step: "02",
    title: "Controlled Exploitation & Adversary Emulation",
    subtitle: "Manual zero-day and chained logic flaw weaponization",
    icon: Terminal,
    duration: "Day 4–10",
    deliverable: "Deterministic Proof-of-Concept Exploit Logs",
    activities: [
      "Manual business logic bypass & IDOR privilege escalation",
      "Web API vulnerability exploitation (JWT, SSRF, SQLi, XSS)",
      "Internal Active Directory Kerberoasting & lateral movement simulation",
      "Zero-day heuristic testing on custom microservices",
    ],
    tooling: ["Burp Suite Professional", "Metasploit Pro", "Nuclei Custom Templates", "CryptoTrace Engine"],
    mitreCoverage: "Initial Access (TA0001) · Execution (TA0002) · Privilege Escalation (TA0004)",
  },
  {
    step: "03",
    title: "Impact Triaging & Executive Debrief",
    subtitle: "CVSS v3.1 + EPSS risk scoring and board-ready reports",
    icon: FileSpreadsheet,
    duration: "Day 11–12",
    deliverable: "Executive Risk Dossier & Technical Remediation Plan",
    activities: [
      "Combined CVSS v3.1 severity × EPSS exploitation probability scoring",
      "Quantified business risk matrix (financial, regulatory & operational)",
      "Step-by-step video reproduction & terminal log verification",
      "Executive briefing session with CTO & CISO leadership",
    ],
    tooling: ["SafeByte EPSS Calculator", "CVSS v3.1 Engine", "Executive Dashboard"],
    mitreCoverage: "Impact (TA0040) · Defense Evasion (TA0005)",
  },
  {
    step: "04",
    title: "Remediation Verification & Attestation",
    subtitle: "Patch validation, retesting, and compliance certification",
    icon: ShieldCheck,
    duration: "Day 13–15",
    deliverable: "Official Letter of Attestation & Security Clean-Bill",
    activities: [
      "100% retesting of every identified vulnerability after developer patches",
      "Verification of perimeter firewall & WAF virtual patching rules",
      "Formal Letter of Attestation suitable for customers, auditors & insurers",
      "30-day continuous regression monitoring inclusion",
    ],
    tooling: ["SafeByte Retest Validator", "Continuous Monitoring Daemon"],
    mitreCoverage: "Hardening Attestation · ISO 27001 Annex A Verification",
  },
];

export default function MethodologyTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const currentPhase = phases[activeStep];

  return (
    <div className="w-full">
      {/* Step selector bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {phases.map((p, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={p.step}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden shadow-sm ${
                isActive
                  ? "bg-primary/10 border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                  : "bg-card/70 border-border hover:bg-muted/70 hover:border-border/90"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
              )}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  PHASE {p.step}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">{p.duration}</span>
              </div>
              <h4 className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</h4>
            </button>
          );
        })}
      </div>

      {/* Active Phase Deep Dive Card */}
      <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 relative overflow-hidden shadow-xl">
        {/* Subtle glowing corner */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Scope & Activities */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <currentPhase.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
                  PHASE {currentPhase.step} · {currentPhase.duration}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{currentPhase.title}</h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{currentPhase.subtitle}</p>

            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                Key Engineering Activities:
              </div>
              {currentPhase.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/85 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Deliverable, Tooling & MITRE */}
          <div className="lg:col-span-5 space-y-4 rounded-xl border border-border bg-muted/40 p-5 font-mono text-xs">
            <div>
              <div className="text-muted-foreground/80 text-[10px] uppercase tracking-widest mb-1">
                PRIMARY DELIVERABLE
              </div>
              <div className="font-bold text-primary flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" />
                {currentPhase.deliverable}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <div className="text-muted-foreground/80 text-[10px] uppercase tracking-widest mb-1.5">
                SECURITY TOOLING &amp; ENGINES
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentPhase.tooling.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded bg-card border border-border text-foreground/80 text-[11px]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <div className="text-muted-foreground/80 text-[10px] uppercase tracking-widest mb-1">
                MITRE ATT&amp;CK® MAPPING
              </div>
              <div className="text-muted-foreground text-[11px] leading-relaxed">
                {currentPhase.mitreCoverage}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

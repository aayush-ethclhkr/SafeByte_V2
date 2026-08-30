import { Link } from "react-router-dom";
import {
  Search,
  Bot,
  BarChart3,
  Shield,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Bitcoin,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import TiltCard from "@/components/TiltCard";

const detailedServices = [
  {
    id: "pentest",
    icon: Search,
    title: "Offensive Penetration Testing",
    code: "SVC-01",
    tier: "CORE CAPABILITY",
    tagline: "Manual adversary simulation across web, API, mobile, and internal networks.",
    desc: "Our OSCP and CRTP-certified team executes controlled, real-world exploitation against your perimeter. Unlike automated point-and-click scanners, our testing identifies complex multi-step authorization flaws, cryptographic implementation errors, business logic vulnerabilities, and privilege escalation chains.",
    methodology: "NIST SP 800-115 · OWASP ASVS v4.0 · PTES Standard",
    features: [
      "Web Applications & Single-Page Apps (SPA)",
      "REST, GraphQL & gRPC API Security",
      "iOS & Android Mobile Binary Reverse Engineering",
      "Active Directory & Internal Network Pivoting",
      "Zero-Day Business Logic Vulnerability Hunting",
    ],
    deliverables: [
      "Deterministic Proof-of-Concept Exploit Scripts",
      "CVSS v3.1 + EPSS Risk Prioritization Matrix",
      "Direct Developer Remediation & Code Diff Guidance",
      "Official Letter of Attestation upon 30-Day Free Retest",
    ],
  },
  {
    id: "redteam",
    icon: Bot,
    title: "AI Red Teaming & Adversary Emulation",
    code: "SVC-02",
    tier: "ADVERSARY SIMULATION",
    tagline: "Stress-test blue team detection, SIEM correlation, and SOC responsiveness.",
    desc: "We emulate Nation-State and Advanced Persistent Threat (APT) attack lifecycles mapped directly to the MITRE ATT&CK® matrix. From initial spear-phishing payload delivery and endpoint defense evasion to domain controller compromise, we evaluate how well your people, processes, and detection tooling respond under real fire.",
    methodology: "MITRE ATT&CK Framework · Cyber Kill Chain®",
    features: [
      "Custom EDR & AV Payload Evasion Development",
      "Living-off-the-Land (LotL) Binary Exploitation",
      "Active Directory Kerberoasting & Token Theft",
      "Cloud Lateral Movement (AWS / Azure / GCP)",
      "SOC Alert Efficacy & Triage Speed Benchmark",
    ],
    deliverables: [
      "End-to-End Attack Path Timeline Log",
      "Blue Team Detection Gap Analysis",
      "SIEM & EDR Custom Detection Rule Package",
      "Executive Board Presentation on Enterprise Resilience",
    ],
  },
  {
    id: "crypto",
    icon: Bitcoin,
    title: "CryptoTrace & Smart Contract Auditing",
    code: "SVC-03",
    tier: "WEB3 & BLOCKCHAIN",
    tagline: "Multi-chain transaction intelligence, DeFi logic auditing, and OFAC compliance.",
    desc: "Comprehensive smart contract auditing and on-chain forensic investigation. SafeByte's proprietary CryptoTrace AI engine tracks fund flows across 7 major blockchain networks (Ethereum, Bitcoin, Solana, Polygon, BSC, Tron, Arbitrum), identifying mixer interactions, flash-loan vulnerabilities, and sanctioned wallet clusters.",
    methodology: "SWC Registry · EIP Standards · Chainalysis/OFAC Registry Sync",
    features: [
      "Solidity & Rust Smart Contract Logic Audits",
      "Flash-Loan & Price Oracle Manipulation Testing",
      "Multi-Chain Wallet Tracing & Heuristic Clustering",
      "OFAC / FinCEN Sanctioned Address Cross-Checking",
      "Reentrancy & Integer Arithmetic Verification",
    ],
    deliverables: [
      "Mathematical Proof of Contract Safety",
      "Interactive Multi-Chain Fund Flow Graph",
      "High-Risk Wallet Attribution & Forensic Dossier",
      "Gas Optimization & Security Refactoring Advisory",
    ],
  },
  {
    id: "vuln",
    icon: BarChart3,
    title: "Vulnerability Exposure & Attack Surface Indexing",
    code: "SVC-06",
    tier: "CONTINUOUS DEFENSE",
    tagline: "Prioritize vulnerabilities based on real-world weaponization probability (EPSS).",
    desc: "Stop drowning in thousands of low-impact scanner alerts. SafeByte combines CVE telemetry with Exploit Prediction Scoring System (EPSS) data to pinpoint the tiny fraction of vulnerabilities that attackers are actively exploiting in the wild today.",
    methodology: "FIRST.org EPSS Standard · NVD CVE Metrics · CVSS v3.1",
    features: [
      "Continuous External Attack Surface Mapping (EASM)",
      "EPSS Real-World Exploitability Risk Scoring",
      "Darknet & Leaked Credential Discovery",
      "Subdomain Takeover & DNS Drift Monitoring",
      "Automated Patch Validation Telemetry",
    ],
    deliverables: [
      "Live Attack Surface Executive Dashboard",
      "Dynamic Top-10 Remediation Priority Matrix",
      "Quarterly Posture Evolution Benchmarks",
      "Integration with Jira, GitHub, and SIEM pipelines",
    ],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      {/* ── Header Section ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4 animate-fade-up">
            <Shield className="h-3.5 w-3.5" /> SECURITY CAPABILITIES CATALOG
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Engineered Offensive Defense for High-Stakes Systems
          </h1>
          <p
            className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Every SafeByte service is conducted manually by certified practitioners (OSCP, CEH, CRTP) with deterministic proof-of-concept testing, actionable code fixes, and guaranteed 30-day free retesting.
          </p>
        </div>
      </section>

      {/* ── Detailed Services List ────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container space-y-12">
          {detailedServices.map((svc, i) => (
            <ScrollReveal key={svc.id} delay={i * 60}>
              <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl hover:border-primary/40 transition-colors">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Icon & Core Details */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                          <svc.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {svc.tier}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">{svc.title}</h2>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground/60 hidden sm:inline">{svc.code}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                      {svc.tagline}
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {svc.desc}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                        Testing Scope &amp; Focus Areas:
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {svc.features.map((f) => (
                          <div key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Methodology & Deliverables */}
                  <div className="lg:col-span-5 space-y-5 rounded-xl border border-border bg-muted/40 p-5 sm:p-6 font-mono text-xs">
                    <div>
                      <div className="text-muted-foreground/70 text-[10px] uppercase tracking-widest mb-1.5">
                        ALIGNED METHODOLOGIES
                      </div>
                      <div className="text-primary font-bold text-xs">{svc.methodology}</div>
                    </div>

                    <div className="pt-4 border-t border-border/60 space-y-2">
                      <div className="text-muted-foreground/70 text-[10px] uppercase tracking-widest mb-1.5">
                        VERIFIED DELIVERABLES
                      </div>
                      {svc.deliverables.map((del, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-foreground/80 font-sans">
                          <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border/60">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md" asChild>
                        <Link to="/contact">
                          Request Scoping for {svc.title} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Bottom Scoping Call Banner ────────────────────────────────────── */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container text-center max-w-2xl mx-auto">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Need a Custom Multi-Tier Engagement?
            </h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              We frequently design hybrid offensive assessments combining external perimeter penetration testing, smart contract auditing, and cloud IAM hardening.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md" asChild>
              <Link to="/contact">Schedule Technical Scoping Call</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

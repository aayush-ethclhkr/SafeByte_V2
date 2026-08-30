import { Shield, CheckCircle2, Lock, FileCheck, Layers, Cpu } from "lucide-react";

interface Framework {
  id: string;
  name: string;
  category: string;
  standard: string;
  icon: typeof Shield;
  scope: string;
}

const frameworks: Framework[] = [
  {
    id: "nist",
    name: "NIST SP 800-115 / CSF 2.0",
    category: "FEDERAL STANDARD",
    standard: "Technical Guide to Information Security Testing & Assessment",
    icon: Shield,
    scope: "Flaw validation, active penetration testing, and risk-tier mitigation",
  },
  {
    id: "mitre",
    name: "MITRE ATT&CK® Matrix",
    category: "ADVERSARY TACTICS",
    standard: "Enterprise Adversarial Tactics, Techniques & Procedures",
    icon: Cpu,
    scope: "Mapping real-world APT execution chains from initial access to exfiltration",
  },
  {
    id: "owasp",
    name: "OWASP ASVS v4.0 & Top 10",
    category: "APPLICATION SECURITY",
    standard: "Application Security Verification Standard",
    icon: Lock,
    scope: "Deep API, business logic, authorization bypass, and injection testing",
  },
  {
    id: "iso",
    name: "ISO/IEC 27001 : 2022",
    category: "GLOBAL COMPLIANCE",
    standard: "Information Security Management Systems",
    icon: FileCheck,
    scope: "Security controls audit, Annex A compliance mapping, ISMS gap remediation",
  },
  {
    id: "cis",
    name: "CIS Critical Controls v8",
    category: "DEFENSIVE BASELINE",
    standard: "Center for Internet Security Implementation Groups",
    icon: Layers,
    scope: "Endpoint hardening, asset surface discovery, and identity boundary verification",
  },
  {
    id: "soc2",
    name: "SOC 2 Type II Alignment",
    category: "ENTERPRISE ASSURANCE",
    standard: "AICPA Trust Services Criteria (Security & Confidentiality)",
    icon: CheckCircle2,
    scope: "Continuous third-party security posture reporting and vendor assessment",
  },
];

export default function TrustFrameworks() {
  return (
    <section className="py-14 border-y border-border bg-muted/30 relative overflow-hidden">
      {/* Background cyber lines */}
      <div className="absolute inset-0 cyber-dots opacity-40 pointer-events-none" />

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-widest uppercase mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Standardized Methodologies &amp; Frameworks
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Audited to International Cybersecurity Standards
            </h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-md font-mono">
            Every SafeByte assessment follows deterministic, industry-certified testing standards to guarantee zero false positives.
          </p>
        </div>

        {/* Frameworks Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className="group relative p-3.5 rounded-lg border border-border bg-card/70 hover:bg-muted/80 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <fw.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/80 tracking-wider">
                    {fw.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {fw.name}
                </h4>
              </div>

              <div className="mt-2 pt-2 border-t border-border/60">
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                  {fw.scope}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

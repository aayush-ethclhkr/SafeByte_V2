import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Plus, Trash2, Search, ChevronRight, ExternalLink,
  AlertTriangle, XCircle, CheckCircle, Info, Zap, Target,
  TrendingUp, Package, RotateCcw, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ServiceEntry { id: string; name: string; version: string }

interface CVE {
  id: string;
  description: string;
  plainEnglish: string;
  cvss: number;
  cvssVector: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  epss: number;           // 0–1 probability
  epssPercentile: number; // 0–100
  fixedIn: string;
  published: string;
  references: string[];
  priorityScore: number;  // cvss * epss — our combined score
}

interface ServiceResult {
  service: string;
  version: string;
  cves: CVE[];
  topRisk: CVE | null;
  serviceScore: number;
}

interface ScanResult {
  services: ServiceResult[];
  attackSurfaceScore: number;
  attackSurfaceLabel: string;
  totalCVEs: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topPriority: CVE[];
  scannedAt: string;
}

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Web Server",   services: [{ name: "nginx",   version: "1.18.0" }, { name: "openssl", version: "1.1.1" }] },
  { label: "SSH Server",   services: [{ name: "openssh", version: "8.2p1" }] },
  { label: "LAMP Stack",   services: [{ name: "apache",  version: "2.4.49" }, { name: "mysql", version: "5.7.36" }, { name: "php", version: "8.0.0" }] },
  { label: "Node.js App",  services: [{ name: "nodejs",  version: "14.0.0" }, { name: "nginx", version: "1.20.0" }] },
  { label: "Database",     services: [{ name: "mysql",   version: "8.0.26" }, { name: "redis", version: "6.2.0" }] },
];

const NVD_API_KEY = import.meta.env.VITE_NVD_API_KEY as string;

// ── Severity helpers ──────────────────────────────────────────────────────────
function cvssToSeverity(score: number): CVE["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0)    return "LOW";
  return "NONE";
}

const SEVERITY_STYLES: Record<CVE["severity"], { bg: string; text: string; border: string; badge: string }> = {
  CRITICAL: { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    badge: "bg-red-500/20 text-red-400 border-red-500/40" },
  HIGH:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", badge: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  MEDIUM:   { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
  LOW:      { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   badge: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  NONE:     { bg: "bg-muted/20",      text: "text-muted-foreground", border: "border-border/50", badge: "bg-muted/30 text-muted-foreground border-border/50" },
};

function SeverityBadge({ severity, score }: { severity: CVE["severity"]; score?: number }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.badge}`}>
      {severity}{score !== undefined ? ` ${score.toFixed(1)}` : ""}
    </span>
  );
}

// ── Plain-English CVE rewriter ────────────────────────────────────────────────
function makePlainEnglish(desc: string, severity: CVE["severity"], epss: number): string {
  const epssStr = epss > 0.1
    ? `There is a ${(epss * 100).toFixed(1)}% chance this is actively exploited right now.`
    : epss > 0.01
    ? `A small but real chance (${(epss * 100).toFixed(2)}%) this gets exploited soon.`
    : `Low exploitation probability currently.`;

  const impact =
    severity === "CRITICAL" ? "An attacker could fully take over the affected system remotely." :
    severity === "HIGH"     ? "An attacker could gain significant control or access sensitive data." :
    severity === "MEDIUM"   ? "An attacker could disrupt the service or access limited data." :
                              "Limited impact — attacker needs specific conditions to exploit this.";

  // Simplify common jargon
  let plain = desc
    .replace(/heap-based buffer overflow/gi, "memory corruption bug")
    .replace(/use-after-free/gi,            "memory management flaw")
    .replace(/null pointer dereference/gi,  "crash-causing bug")
    .replace(/improper input validation/gi, "missing input checks")
    .replace(/out-of-bounds (read|write)/gi,"memory boundary violation")
    .replace(/SQL injection/gi,             "SQL injection (attacker can read/modify your database)")
    .replace(/cross-site scripting/gi,      "XSS (attacker can run code in users' browsers)")
    .replace(/remote code execution/gi,     "remote code execution (RCE) — attacker can run any command")
    .replace(/privilege escalation/gi,      "privilege escalation (attacker gains admin access)")
    .replace(/denial of service/gi,         "denial of service (DoS) — attacker can crash the service");

  // Trim to ~120 chars for readability
  if (plain.length > 150) plain = plain.slice(0, 147) + "...";

  return `${impact} ${epssStr} Details: ${plain}`;
}

// ── NVD API fetch ─────────────────────────────────────────────────────────────
async function fetchCVEs(service: string, version: string): Promise<CVE[]> {
  const query = version ? `${service} ${version}` : service;
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=15`;

  const res = await fetch(url, {
    headers: { "apiKey": NVD_API_KEY },
  });

  if (!res.ok) throw new Error(`NVD API error: ${res.status}`);
  const data = await res.json();
  const items = data.vulnerabilities ?? [];

  const cves: CVE[] = items.map((item: Record<string, unknown>) => {
    const cve = item.cve as Record<string, unknown>;
    const metrics = cve.metrics as Record<string, unknown> ?? {};
    const id = cve.id as string;

    // Get CVSS score — try v3.1, v3.0, v2
    let cvss = 0;
    let cvssVector = "";
    const v31 = (metrics.cvssMetricV31 as unknown[])?.[0] as Record<string, unknown>;
    const v30 = (metrics.cvssMetricV30 as unknown[])?.[0] as Record<string, unknown>;
    const v2  = (metrics.cvssMetricV2  as unknown[])?.[0] as Record<string, unknown>;

    if (v31) {
      const d = v31.cvssData as Record<string, unknown>;
      cvss = (d?.baseScore as number) ?? 0;
      cvssVector = (d?.vectorString as string) ?? "";
    } else if (v30) {
      const d = v30.cvssData as Record<string, unknown>;
      cvss = (d?.baseScore as number) ?? 0;
      cvssVector = (d?.vectorString as string) ?? "";
    } else if (v2) {
      const d = v2.cvssData as Record<string, unknown>;
      cvss = (d?.baseScore as number) ?? 0;
      cvssVector = (d?.vectorString as string) ?? "";
    }

    const descriptions = cve.descriptions as { lang: string; value: string }[];
    const desc = descriptions?.find(d => d.lang === "en")?.value ?? "No description available.";
    const severity = cvssToSeverity(cvss);

    const refs = (cve.references as { url: string }[] ?? []).slice(0, 3).map(r => r.url);

    const published = (cve.published as string)?.slice(0, 10) ?? "";

    return {
      id,
      description: desc,
      plainEnglish: "",   // filled after EPSS
      cvss,
      cvssVector,
      severity,
      epss: 0,
      epssPercentile: 0,
      fixedIn: "",
      published,
      references: refs,
      priorityScore: 0,
    } as CVE;
  });

  return cves;
}

// ── EPSS fetch (FIRST.org) ────────────────────────────────────────────────────
async function fetchEPSS(cveIds: string[]): Promise<Map<string, { epss: number; percentile: number }>> {
  const map = new Map<string, { epss: number; percentile: number }>();
  if (!cveIds.length) return map;

  try {
    const ids = cveIds.slice(0, 30).join(",");
    const res = await fetch(`https://api.first.org/data/v1/epss?cve=${ids}`);
    if (!res.ok) return map;
    const data = await res.json();
    for (const item of data.data ?? []) {
      map.set(item.cve, {
        epss:       parseFloat(item.epss ?? "0"),
        percentile: parseFloat(item.percentile ?? "0") * 100,
      });
    }
  } catch (_) { /* EPSS is best-effort */ }

  return map;
}

// ── Attack surface score ──────────────────────────────────────────────────────
function computeAttackSurface(services: ServiceResult[]): { score: number; label: string } {
  if (!services.length) return { score: 0, label: "Unknown" };

  let score = 0;
  for (const s of services) {
    const criticals = s.cves.filter(c => c.severity === "CRITICAL").length;
    const highs     = s.cves.filter(c => c.severity === "HIGH").length;
    const mediums   = s.cves.filter(c => c.severity === "MEDIUM").length;
    score += criticals * 20 + highs * 10 + mediums * 4;
    // High exploitation probability bonus
    score += s.cves.filter(c => c.epss > 0.1).length * 8;
  }

  score = Math.min(100, score);
  const label =
    score >= 75 ? "CRITICAL RISK" :
    score >= 50 ? "HIGH RISK"     :
    score >= 25 ? "MEDIUM RISK"   :
    score > 0   ? "LOW RISK"      : "MINIMAL RISK";

  return { score, label };
}

// ── Main scan orchestrator ────────────────────────────────────────────────────
async function runScan(entries: ServiceEntry[]): Promise<ScanResult> {
  const serviceResults: ServiceResult[] = [];

  for (const entry of entries) {
    let cves = await fetchCVEs(entry.name, entry.version);

    // Fetch EPSS for all CVE IDs
    const epssMap = await fetchEPSS(cves.map(c => c.id));

    // Enrich CVEs with EPSS + priority score + plain English
    cves = cves.map(c => {
      const epssData = epssMap.get(c.id) ?? { epss: 0, percentile: 0 };
      const enriched: CVE = {
        ...c,
        epss:          epssData.epss,
        epssPercentile:epssData.percentile,
        priorityScore: c.cvss * (epssData.epss > 0 ? epssData.epss * 10 + 1 : 1),
      };
      enriched.plainEnglish = makePlainEnglish(c.description, c.severity, enriched.epss);
      return enriched;
    });

    // Sort by priority score descending
    cves.sort((a, b) => b.priorityScore - a.priorityScore);

    const serviceScore = cves.reduce((acc, c) => {
      return acc + (c.severity === "CRITICAL" ? 20 : c.severity === "HIGH" ? 10 : c.severity === "MEDIUM" ? 4 : 1);
    }, 0);

    serviceResults.push({
      service:      entry.name,
      version:      entry.version,
      cves,
      topRisk:      cves[0] ?? null,
      serviceScore: Math.min(100, serviceScore),
    });
  }

  const allCVEs = serviceResults.flatMap(s => s.cves);
  const { score, label } = computeAttackSurface(serviceResults);

  return {
    services:            serviceResults,
    attackSurfaceScore:  score,
    attackSurfaceLabel:  label,
    totalCVEs:           allCVEs.length,
    criticalCount:       allCVEs.filter(c => c.severity === "CRITICAL").length,
    highCount:           allCVEs.filter(c => c.severity === "HIGH").length,
    mediumCount:         allCVEs.filter(c => c.severity === "MEDIUM").length,
    lowCount:            allCVEs.filter(c => c.severity === "LOW").length,
    topPriority:         [...allCVEs].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5),
    scannedAt:           new Date().toLocaleString(),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75 ? "#ef4444" :
    score >= 50 ? "#f97316" :
    score >= 25 ? "#eab308" : "#22c55e";
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="26" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="10">/100</text>
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function EPSSBar({ value, percentile }: { value: number; percentile: number }) {
  const pct = Math.min(100, value * 100);
  const color = pct > 20 ? "#ef4444" : pct > 5 ? "#f97316" : "#22c55e";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Exploitation Probability (EPSS)</span>
        <span className="font-mono font-bold" style={{ color }}>{pct.toFixed(2)}%</span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-muted-foreground">Higher than {percentile.toFixed(0)}% of all CVEs</p>
    </div>
  );
}

function CVECard({ cve }: { cve: CVE }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEVERITY_STYLES[cve.severity];

  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noopener noreferrer"
              className={`font-mono text-sm font-bold hover:underline flex items-center gap-1 ${s.text}`}>
              {cve.id} <ExternalLink className="h-3 w-3" />
            </a>
            <SeverityBadge severity={cve.severity} score={cve.cvss} />
            {cve.epss > 0.05 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" /> ACTIVELY EXPLOITED
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{cve.published}</span>
        </div>

        {/* Plain English explanation */}
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">{cve.plainEnglish}</p>

        <EPSSBar value={cve.epss} percentile={cve.epssPercentile} />

        {cve.fixedIn && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
            <Package className="h-3.5 w-3.5" />
            Fixed in version: <span className="font-mono font-bold">{cve.fixedIn}</span>
          </div>
        )}

        <button onClick={() => setExpanded(v => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Less detail" : "Technical detail"}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">{cve.description}</p>
          {cve.cvssVector && (
            <p className="text-xs font-mono text-muted-foreground">Vector: {cve.cvssVector}</p>
          )}
          {cve.references.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">References:</p>
              {cve.references.map((ref, i) => (
                <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline truncate">{ref}</a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function VulnScanner() {
  const [services, setServices] = useState<ServiceEntry[]>([
    { id: "1", name: "", version: "" },
  ]);
  const [scanning, setScanning]  = useState(false);
  const [progress, setProgress]  = useState("");
  const [result, setResult]      = useState<ScanResult | null>(null);
  const [error, setError]        = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const addService = () => setServices(s => [...s, { id: Date.now().toString(), name: "", version: "" }]);
  const removeService = (id: string) => setServices(s => s.filter(e => e.id !== id));
  const updateService = (id: string, field: "name" | "version", value: string) =>
    setServices(s => s.map(e => e.id === id ? { ...e, [field]: value } : e));

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setServices(preset.services.map((s, i) => ({ id: String(i + 1), ...s })));
    setResult(null);
    setError("");
  };

  const scan = useCallback(async () => {
    const valid = services.filter(s => s.name.trim());
    if (!valid.length) { setError("Add at least one service to scan."); return; }
    setError("");
    setResult(null);
    setScanning(true);

    try {
      for (let i = 0; i < valid.length; i++) {
        setProgress(`Scanning ${valid[i].name}${valid[i].version ? " " + valid[i].version : ""} (${i + 1}/${valid.length})...`);
        await new Promise(r => setTimeout(r, 300));
      }
      setProgress("Fetching EPSS exploitation scores...");
      const scanResult = await runScan(valid);
      setResult(scanResult);
      setActiveTab("overview");
    } catch (e: unknown) {
      setError(`Scan failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setScanning(false);
      setProgress("");
    }
  }, [services]);

  const overallIcon =
    !result ? Shield :
    result.attackSurfaceScore >= 75 ? XCircle :
    result.attackSurfaceScore >= 50 ? AlertTriangle :
    result.attackSurfaceScore >= 25 ? AlertTriangle : CheckCircle;
  const OIcon = overallIcon;

  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link to="/tools" className="hover:text-primary transition-colors">Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">VulnHawk</span>
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">VulnHawk  v1.0.1</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Vulnerability Assessment
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Enter your software stack. Get a complete CVE analysis with real exploitation probabilities,
                plain-English risk explanations, and a prioritised fix roadmap — powered by NVD + EPSS.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container max-w-4xl space-y-6">

          {/* Input Panel */}
          {!result && (
            <ScrollReveal>
              <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-5">
                {/* Presets */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Quick Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service entries */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Software Stack</p>
                  {services.map((entry, i) => (
                    <div key={entry.id} className="flex gap-3 items-center">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <Input
                        placeholder="Service (e.g. nginx, openssh, apache)"
                        value={entry.name}
                        onChange={e => updateService(entry.id, "name", e.target.value)}
                        className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 text-sm"
                        onKeyDown={e => e.key === "Enter" && scan()}
                      />
                      <Input
                        placeholder="Version (e.g. 1.18.0)"
                        value={entry.version}
                        onChange={e => updateService(entry.id, "version", e.target.value)}
                        className="w-36 bg-background/50 border-border/50 focus:border-primary/50 text-sm"
                        onKeyDown={e => e.key === "Enter" && scan()}
                      />
                      {services.length > 1 && (
                        <button onClick={() => removeService(entry.id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addService}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-1">
                    <Plus className="h-4 w-4" /> Add another service
                  </button>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button onClick={scan} disabled={scanning} size="lg" className="gap-2 w-full md:w-auto">
                  <Search className="h-4 w-4" />
                  {scanning ? progress || "Scanning..." : "Run Vulnerability Scan"}
                </Button>

                <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-border/30">
                  {[
                    { icon: Target,    title: "NVD Database",   desc: "Live CVE data from the National Vulnerability Database" },
                    { icon: TrendingUp,title: "EPSS Scores",    desc: "Real exploitation probability from FIRST.org" },
                    { icon: Zap,       title: "Priority Score", desc: "Combined CVSS × EPSS — fix what matters most first" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3 items-start">
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Scanning state */}
          {scanning && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-16 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">Scanning your stack...</p>
              <p className="text-sm text-primary font-mono">{progress}</p>
              <div className="w-48 h-1 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Summary bar */}
              <ScrollReveal>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <ScoreRing score={result.attackSurfaceScore} label={result.attackSurfaceLabel} />
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Attack Surface Score</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {result.totalCVEs} CVEs across {result.services.length} service(s) · Scanned {result.scannedAt}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Critical", count: result.criticalCount, color: "text-red-400",    bg: "bg-red-500/10" },
                          { label: "High",     count: result.highCount,     color: "text-orange-400", bg: "bg-orange-500/10" },
                          { label: "Medium",   count: result.mediumCount,   color: "text-yellow-400", bg: "bg-yellow-500/10" },
                          { label: "Low",      count: result.lowCount,      color: "text-blue-400",   bg: "bg-blue-500/10" },
                        ].map(s => (
                          <div key={s.label} className={`rounded-lg p-3 ${s.bg} text-center`}>
                            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.count}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Tabs */}
              <ScrollReveal delay={80}>
                <div className="flex gap-1 rounded-lg bg-muted/30 p-1 border border-border/50">
                  {[
                    { id: "overview",  label: "Top Priorities" },
                    ...result.services.map(s => ({ id: s.service, label: `${s.service}${s.version ? " " + s.version : ""}` })),
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              {/* Tab content */}
              <ScrollReveal delay={120}>
                {activeTab === "overview" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <OIcon className={`h-5 w-5 ${result.attackSurfaceScore >= 50 ? "text-red-400" : "text-yellow-400"}`} />
                      <h3 className="font-semibold text-foreground">Top 5 Highest-Priority Vulnerabilities</h3>
                      <span className="text-xs text-muted-foreground">(sorted by CVSS × EPSS)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These are the vulnerabilities you should patch first — ranked by both severity AND real-world exploitation likelihood.
                    </p>
                    {result.topPriority.length === 0 ? (
                      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-green-400">No significant vulnerabilities found</p>
                          <p className="text-sm text-muted-foreground mt-1">No CVEs matched for your stack. Keep your software updated and re-scan periodically.</p>
                        </div>
                      </div>
                    ) : (
                      result.topPriority.map(cve => <CVECard key={cve.id} cve={cve} />)
                    )}
                  </div>
                ) : (
                  (() => {
                    const svc = result.services.find(s => s.service === activeTab);
                    if (!svc) return null;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground capitalize">{svc.service} {svc.version}</h3>
                            <p className="text-sm text-muted-foreground">{svc.cves.length} CVEs found · Service risk score: {svc.serviceScore}/100</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {(["CRITICAL","HIGH","MEDIUM","LOW"] as CVE["severity"][]).map(sev => {
                              const count = svc.cves.filter(c => c.severity === sev).length;
                              return count > 0 ? <SeverityBadge key={sev} severity={sev} /> : null;
                            })}
                          </div>
                        </div>
                        {svc.cves.length === 0 ? (
                          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />
                            <p className="text-sm text-green-400">No CVEs found for this service and version.</p>
                          </div>
                        ) : (
                          svc.cves.map(cve => <CVECard key={cve.id} cve={cve} />)
                        )}
                      </div>
                    );
                  })()
                )}
              </ScrollReveal>

              {/* What to do next */}
              <ScrollReveal delay={160}>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">What to do next</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Patch Critical and High severity CVEs immediately — especially those with high EPSS scores.",
                      "Check the 'Technical detail' on each CVE card for the exact vulnerable component and references.",
                      "If a fixed version is shown, upgrade to at least that version.",
                      "Re-run this scan after patching to verify your attack surface score has improved.",
                      "For a full network port scan, use our VulnHawk CLI tool (Python) on your own machine.",
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* Scan again */}
              <ScrollReveal delay={200}>
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => { setResult(null); setError(""); }} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Scan a Different Stack
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

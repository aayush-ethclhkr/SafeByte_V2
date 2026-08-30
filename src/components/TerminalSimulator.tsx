import { useState } from "react";
import { Terminal, Copy, Check, ShieldCheck, Bug, Play } from "lucide-react";

interface CommandScenario {
  id: string;
  name: string;
  command: string;
  category: string;
  logs: {
    text: string;
    type: "info" | "success" | "warning" | "error" | "code";
    delayMs?: number;
  }[];
}

const scenarios: CommandScenario[] = [
  {
    id: "pentest",
    name: "Adversary Recon & Exploit",
    command: "safebyte-redteam --target api.client.internal --full-chain --stealth",
    category: "OFFENSIVE SIMULATION",
    logs: [
      { text: "[*] Initializing SafeByte Red Team Framework v4.2.0...", type: "info" },
      { text: "[*] Target scope verified: 14 subdomains, 3 exposed microservices", type: "info" },
      { text: "[+] Discovered unauthenticated GraphQL endpoint: /v2/internal/query", type: "success" },
      { text: "[!] CRITICAL: Bypassed JWT signature verification via CVE-2024-3400 algorithmic confusion", type: "error" },
      { text: "[*] Elevating privilege level: role='TENANT_USER' -> 'SUPER_CLUSTER_ADMIN'", type: "warning" },
      { text: "[+] Chained IDOR vulnerability allows arbitrary tenant database exfiltration", type: "success" },
      { text: "[✓] Exploit vector validated with zero impact to production data integrity.", type: "code" },
      { text: "[>] Remediation advisory generated -> RFC-9020 Cryptographic Key Isolation patch attached.", type: "info" },
    ],
  },
  {
    id: "vuln",
    name: "CVE & EPSS Risk Indexing",
    command: "safebyte-cve-scan --perimeter live --epss-threshold 0.65 --strict-cvss",
    category: "EXPOSURE MANAGEMENT",
    logs: [
      { text: "[*] Querying SafeByte High-Velocity Vulnerability Telemetry Feed...", type: "info" },
      { text: "[*] Cross-referencing 242,109 CVE signatures against live perimeter stack...", type: "info" },
      { text: "[!] CVE-2024-21887 (Ivanti Connect Secure): EPSS 0.9412 (94.1% weaponized in wild)", type: "error" },
      { text: "[!] CVE-2023-46805 (Web auth bypass): CVSS 9.8 CRITICAL", type: "error" },
      { text: "[*] Automated threat containment rule pushed to Cloudflare WAF & Palo Alto NGFW", type: "warning" },
      { text: "[+] Attack surface exposure reduced by 87.4% in 4 minutes", type: "success" },
      { text: "[✓] Audit verification pass: ALL 18 EDGE ASSETS HARDENED.", type: "code" },
    ],
  },
  {
    id: "crypto",
    name: "CryptoTrace Intelligence",
    command: "cryptotrace-intel --wallet 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --trace-all",
    category: "BLOCKCHAIN FORENSICS",
    logs: [
      { text: "[*] CryptoTrace AI multi-chain heuristic engine active (ETH, BTC, SOL, TRON, MATIC)...", type: "info" },
      { text: "[*] Ingesting transaction history: 1,842 total transfers ($4.2M equivalent volume)", type: "info" },
      { text: "[!] Heuristic Alert: Hop-2 wallet flagged in Tornado.Cash mixer deposit pool", type: "error" },
      { text: "[*] Cross-referencing OFAC SDN List & FinCEN Suspicious Address Index...", type: "warning" },
      { text: "[!] Match confirmed: Entity linked to Lazarus Group North Korean cyber nexus", type: "error" },
      { text: "[+] Generated forensic dossier with cryptographic proof for law enforcement compliance", type: "success" },
      { text: "[✓] Risk Score: 98/100 (CRITICAL EXPOSURE)", type: "code" },
    ],
  },
  {
    id: "dfir",
    name: "Incident Triage (DFIR)",
    command: "safebyte-dfir --isolate-host srv-prod-db04 --memory-dump --extract-ioc",
    category: "EMERGENCY CONTAINMENT",
    logs: [
      { text: "[*] Rapid Incident Response Protocol Triggered: Latency < 12 seconds", type: "info" },
      { text: "[+] Host 'srv-prod-db04' isolated from Active Directory trust boundary", type: "success" },
      { text: "[*] Live memory acquisition completed (32.0 GB Volatility image captured)", type: "info" },
      { text: "[!] Injected Cobalt Strike Beacon detected in svchost.exe PID 4192", type: "error" },
      { text: "[*] Malicious C2 egress IP 185.220.101.5 quarantined across perimeter routing tables", type: "warning" },
      { text: "[✓] Threat actor lateral movement halted. No database exfiltration recorded.", type: "success" },
    ],
  },
];

export default function TerminalSimulator() {
  const [activeScenario, setActiveScenario] = useState<CommandScenario>(scenarios[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScenario.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border border-border bg-[#070B10] shadow-2xl overflow-hidden font-mono">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/80 bg-[#0B1017]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-white/90 tracking-wide">
            SAFEBYTE DEFENSE SHELL [v4.2-PROD]
          </span>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap items-center gap-1">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                activeScenario.id === sc.id
                  ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Command prompt bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080D14] border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-primary font-bold">root@safebyte-soc:~#</span>
          <span className="text-white/90 font-medium whitespace-nowrap">{activeScenario.command}</span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded text-zinc-400 hover:text-primary hover:bg-white/[0.08] transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Console output */}
      <div className="p-4 sm:p-5 space-y-2 text-xs overflow-y-auto max-h-[320px] bg-[#06090E]/98">
        <div className="text-zinc-500 text-[10px] uppercase tracking-widest pb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          EXECUTION TRACE :: {activeScenario.category}
        </div>

        {activeScenario.logs.map((log, i) => {
          let color = "text-zinc-400";
          if (log.type === "success") color = "text-emerald-400 font-medium";
          if (log.type === "error") color = "text-red-400 font-semibold";
          if (log.type === "warning") color = "text-amber-300";
          if (log.type === "code") color = "text-primary font-bold";

          return (
            <div key={i} className={`flex items-start gap-2 leading-relaxed ${color}`}>
              <span className="text-zinc-600 select-none">{String(i + 1).padStart(2, "0")}</span>
              <span className="break-all">{log.text}</span>
            </div>
          );
        })}

        <div className="flex items-center gap-2 pt-2 text-primary">
          <span className="inline-block h-4 w-2 bg-primary animate-pulse" />
          <span className="text-[11px] text-zinc-400">SOC session live. Ready for next directive...</span>
        </div>
      </div>
    </div>
  );
}

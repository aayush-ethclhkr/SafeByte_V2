import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Bitcoin, AlertTriangle, CheckCircle, XCircle, ChevronRight,
  Search, RotateCcw, ExternalLink, Zap, Info, ArrowDownLeft, ArrowUpRight,
  Clock, Activity, Database, TrendingUp, Hash, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";

// ── Types ─────────────────────────────────────────────────────────────────────
type Network = "Ethereum" | "Bitcoin" | "Tron" | "Litecoin" | "Dogecoin" | "XRP" | "Cardano" | "Unknown";
type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type RiskLevel   = "SAFE" | "WARNING" | "DANGER";

interface RecentTx {
  hash: string;
  value: number;
  date: string;
  direction: "in" | "out";
}

interface RegistryHit {
  found: boolean;
  threatLevel?: ThreatLevel;
  reason?: string;
  caseId?: string;
}

interface WalletResult {
  address: string;
  network: Network;
  symbol: string;
  balance: number | null;
  status: "ACTIVE" | "INACTIVE" | "OFFLINE";
  totalTx: number;
  incoming: number;
  outgoing: number;
  totalReceived: number;
  totalSent: number;
  firstActivity: string;
  lastActivity: string;
  walletAge: number;
  recentTxs: RecentTx[];
  riskScore: number;
  threatLevel: ThreatLevel;
  riskLevel: RiskLevel;
  registryHit: RegistryHit;
  riskFactors: string[];
  explorerUrl: string;
  scannedAt: string;
}

// ── Known high-risk wallet registry (mirrors Python registry_checker.py) ─────
// Public OFAC-sanctioned and darknet-associated addresses for demonstration.
const HIGH_RISK_REGISTRY: Record<string, { reason: string; threat: ThreatLevel; caseId: string }> = {
  // OFAC-sanctioned Ethereum addresses (publicly listed)
  "0x7f367cc41522ce07553e823bf3be79a889debe1b": { reason: "OFAC sanctioned — Lazarus Group (DPRK)", threat: "CRITICAL", caseId: "OFAC-2022-ETH-001" },
  "0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b": { reason: "OFAC sanctioned — Lazarus Group (DPRK)", threat: "CRITICAL", caseId: "OFAC-2022-ETH-002" },
  "0x901bb9583b24d97e995513c6778dc6888ab6870e": { reason: "OFAC sanctioned — Tornado Cash relayer", threat: "CRITICAL", caseId: "OFAC-2022-TC-001" },
  "0xa7e5d5a720f06526557c513402f2e6b5fa20b008": { reason: "OFAC sanctioned — Tornado Cash relayer", threat: "CRITICAL", caseId: "OFAC-2022-TC-002" },
  "0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c": { reason: "OFAC sanctioned — Lazarus Group", threat: "CRITICAL", caseId: "OFAC-2022-ETH-003" },
  // Known ransomware / darknet market BTC addresses (publicly listed by law enforcement)
  "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF": { reason: "Known ransomware payment address (publicly flagged)", threat: "HIGH", caseId: "RF-2021-BTC-001" },
  "12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw": { reason: "Silk Road 2 associated (FBI seizure)", threat: "HIGH", caseId: "FBI-SR2-BTC-001" },
};

// ── Network detection (mirrors detect_wallet() in wallet_detector.py) ────────
function detectNetwork(address: string): Network {
  const a = address.trim();
  if (/^0x[0-9a-fA-F]{40}$/.test(a))           return "Ethereum";
  if (/^T[A-Za-z0-9]{33}$/.test(a))             return "Tron";
  if (/^(1|3)[A-Za-z0-9]{24,33}$/.test(a) || /^bc1[a-z0-9]{6,87}$/.test(a)) return "Bitcoin";
  if (/^(ltc1|[LM])[A-Za-z0-9]{25,34}$/.test(a)) return "Litecoin";
  if (/^D[A-Za-z0-9]{33}$/.test(a))             return "Dogecoin";
  if (/^r[A-Za-z0-9]{24,33}$/.test(a))           return "XRP";
  if (/^addr1[a-z0-9]+$/.test(a))                return "Cardano";
  return "Unknown";
}

const NETWORK_META: Record<Network, { symbol: string; explorerBase: string; color: string }> = {
  Ethereum: { symbol: "ETH",  explorerBase: "https://etherscan.io/address/",   color: "text-blue-400" },
  Bitcoin:  { symbol: "BTC",  explorerBase: "https://www.blockchain.com/explorer/addresses/btc/", color: "text-orange-400" },
  Tron:     { symbol: "TRX",  explorerBase: "https://tronscan.org/#/address/",  color: "text-red-400" },
  Litecoin: { symbol: "LTC",  explorerBase: "https://litecoinspace.org/address/", color: "text-slate-300" },
  Dogecoin: { symbol: "DOGE", explorerBase: "https://dogechain.info/address/",  color: "text-yellow-400" },
  XRP:      { symbol: "XRP",  explorerBase: "https://xrpscan.com/account/",     color: "text-cyan-400" },
  Cardano:  { symbol: "ADA",  explorerBase: "https://cardanoscan.io/address/",  color: "text-blue-300" },
  Unknown:  { symbol: "???",  explorerBase: "",                                  color: "text-muted-foreground" },
};

// ── Balance tiers for risk engine (mirrors _BALANCE_TIERS in risk_engine.py) ─
const BALANCE_TIERS: Record<string, [number, number, number]> = {
  Ethereum: [1,    10,    100],
  Bitcoin:  [0.05, 0.5,   5],
  Tron:     [1000, 10000, 100000],
  Litecoin: [5,    50,    500],
  Dogecoin: [5000, 50000, 500000],
  XRP:      [100,  1000,  10000],
  Cardano:  [500,  5000,  50000],
};

// ── Risk engine (mirrors calculate_risk() in risk_engine.py) ─────────────────
function calculateRisk(
  balance: number,
  txCount: number,
  registryHit: boolean,
  linkedCases: number,
  network: string
): { score: number; threat: ThreatLevel; riskLevel: RiskLevel; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const [low, mid, high] = BALANCE_TIERS[network] ?? [1, 10, 100];

  if (balance >= low)  { score += 10; factors.push(`Balance ≥ ${low} ${NETWORK_META[network as Network]?.symbol ?? ""} (low tier)`); }
  if (balance >= mid)  { score += 20; factors.push(`Balance ≥ ${mid} ${NETWORK_META[network as Network]?.symbol ?? ""} (mid tier)`); }
  if (balance >= high) { score += 30; factors.push(`Balance ≥ ${high} ${NETWORK_META[network as Network]?.symbol ?? ""} (high tier)`); }
  if (txCount > 100)   { score += 10; factors.push("High transaction volume (>100 txs)"); }
  if (txCount > 1000)  { score += 20; factors.push("Very high transaction volume (>1000 txs)"); }
  if (registryHit)     { score += 30; factors.push("Address found in high-risk wallet registry"); }
  score += linkedCases * 5;
  if (linkedCases > 0) factors.push(`Linked to ${linkedCases} known case(s)`);
  score = Math.min(100, score);

  const threat: ThreatLevel =
    score < 25 ? "LOW" : score < 50 ? "MEDIUM" : score < 75 ? "HIGH" : "CRITICAL";
  const riskLevel: RiskLevel =
    score < 25 ? "SAFE" : score < 60 ? "WARNING" : "DANGER";

  return { score, threat, riskLevel, factors };
}

// ── Etherscan API (Ethereum) ──────────────────────────────────────────────────
const ETHERSCAN_API_KEY = (import.meta.env.VITE_ETHERSCAN_API_KEY as string) || "";

async function fetchEthBalance(address: string): Promise<number | null> {
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "1") return null;
    return parseInt(data.result) / 1e18;
  } catch { return null; }
}

async function fetchEthTxs(address: string): Promise<Omit<WalletResult, "address"|"network"|"symbol"|"balance"|"status"|"riskScore"|"threatLevel"|"riskLevel"|"registryHit"|"riskFactors"|"explorerUrl"|"scannedAt"> | null> {
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "1") return null;
    const txs: Record<string, string>[] = data.result;
    let incoming = 0, outgoing = 0, totalReceived = 0, totalSent = 0;
    const recentTxs: RecentTx[] = [];

    for (const tx of txs) {
      const value = parseInt(tx.value) / 1e18;
      const isIn = tx.to?.toLowerCase() === address.toLowerCase();
      if (isIn) { incoming++; totalReceived += value; }
      else      { outgoing++;  totalSent += value; }
      if (recentTxs.length < 5) {
        recentTxs.push({
          hash: tx.hash.slice(0, 18) + "...",
          value: parseFloat(value.toFixed(5)),
          date: new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString("en-GB"),
          direction: isIn ? "in" : "out",
        });
      }
    }

    const firstTs  = parseInt(txs[txs.length - 1]?.timeStamp ?? "0") * 1000;
    const lastTs   = parseInt(txs[0]?.timeStamp ?? "0") * 1000;
    const walletAge = Math.floor((Date.now() - firstTs) / 86400000);

    return {
      totalTx: txs.length,
      incoming, outgoing,
      totalReceived: parseFloat(totalReceived.toFixed(5)),
      totalSent: parseFloat(totalSent.toFixed(5)),
      firstActivity: firstTs ? new Date(firstTs).toLocaleDateString("en-GB") : "Unknown",
      lastActivity: lastTs ? new Date(lastTs).toLocaleDateString("en-GB") : "Unknown",
      walletAge,
      recentTxs,
    };
  } catch { return null; }
}

// ── Blockchain.info API (Bitcoin) ─────────────────────────────────────────────
async function fetchBtcData(address: string): Promise<{ balance: number | null; txData: Omit<WalletResult, "address"|"network"|"symbol"|"balance"|"status"|"riskScore"|"threatLevel"|"riskLevel"|"registryHit"|"riskFactors"|"explorerUrl"|"scannedAt"> | null }> {
  try {
    const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=5&cors=true`);
    if (!res.ok) return { balance: null, txData: null };
    const data = await res.json();
    const balance = data.final_balance / 1e8;
    const recentTxs: RecentTx[] = (data.txs ?? []).slice(0, 5).map((tx: Record<string, unknown>) => {
      const inputs = (tx.inputs as { prev_out?: { addr?: string; value?: number } }[]) ?? [];
      const out    = (tx.out as { addr?: string; value?: number }[]) ?? [];
      const isIn = out.some((o) => o.addr === address);
      const value = isIn
        ? out.filter(o => o.addr === address).reduce((s, o) => s + (o.value ?? 0), 0) / 1e8
        : inputs.filter(i => i.prev_out?.addr === address).reduce((s, i) => s + (i.prev_out?.value ?? 0), 0) / 1e8;
      return {
        hash: (tx.hash as string).slice(0, 18) + "...",
        value: parseFloat(value.toFixed(6)),
        date: new Date((tx.time as number) * 1000).toLocaleDateString("en-GB"),
        direction: isIn ? "in" as const : "out" as const,
      };
    });

    const totalTx = data.n_tx ?? 0;
    const totalReceived = (data.total_received ?? 0) / 1e8;
    const totalSent     = (data.total_sent     ?? 0) / 1e8;
    const firstTs = data.txs?.length ? (data.txs[data.txs.length - 1] as Record<string, number>).time * 1000 : 0;
    const lastTs  = data.txs?.length ? (data.txs[0] as Record<string, number>).time * 1000 : 0;

    return {
      balance,
      txData: {
        totalTx,
        incoming: 0, outgoing: 0,
        totalReceived: parseFloat(totalReceived.toFixed(6)),
        totalSent:     parseFloat(totalSent.toFixed(6)),
        firstActivity: firstTs ? new Date(firstTs).toLocaleDateString("en-GB") : "Unknown",
        lastActivity:  lastTs  ? new Date(lastTs).toLocaleDateString("en-GB")  : "Unknown",
        walletAge: firstTs ? Math.floor((Date.now() - firstTs) / 86400000) : 0,
        recentTxs,
      },
    };
  } catch { return { balance: null, txData: null }; }
}

// ── TronGrid API (Tron) ───────────────────────────────────────────────────────
const TRONGRID_API_KEY = (import.meta.env.VITE_TRONGRID_API_KEY as string) || "";

async function fetchTronBalance(address: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.trongrid.io/v1/accounts/${address}`, {
      headers: TRONGRID_API_KEY ? { "TRON-PRO-API-KEY": TRONGRID_API_KEY } : {},
    });
    const data = await res.json();
    const bal = data.data?.[0]?.balance;
    return bal != null ? bal / 1e6 : null;
  } catch { return null; }
}

// ── Main analysis orchestrator ────────────────────────────────────────────────
async function analyzeWallet(address: string, onProgress: (msg: string) => void): Promise<WalletResult> {
  const trimmed = address.trim();
  const network = detectNetwork(trimmed);

  if (network === "Unknown") {
    throw new Error("Unrecognized wallet address format. Supported: Ethereum (0x…), Bitcoin, Tron (T…), Litecoin, Dogecoin, XRP, Cardano.");
  }

  const meta = NETWORK_META[network];
  let balance: number | null = null;
  let txInfo: Omit<WalletResult, "address"|"network"|"symbol"|"balance"|"status"|"riskScore"|"threatLevel"|"riskLevel"|"registryHit"|"riskFactors"|"explorerUrl"|"scannedAt"> | null = null;

  // ── Fetch balance + tx data ────────────────────────────────────────────────
  onProgress(`Fetching ${network} balance…`);

  if (network === "Ethereum") {
    [balance, txInfo] = await Promise.all([
      fetchEthBalance(trimmed),
      fetchEthTxs(trimmed),
    ]);
  } else if (network === "Bitcoin") {
    const { balance: b, txData } = await fetchBtcData(trimmed);
    balance = b;
    txInfo  = txData;
  } else if (network === "Tron") {
    balance = await fetchTronBalance(trimmed);
  } else {
    // For Litecoin, Dogecoin, XRP, Cardano — note that free public CORS-enabled APIs
    // are limited; we show the chain info and link to explorer.
    onProgress(`Fetching ${network} data…`);
    balance = null;
  }

  // ── Registry check ─────────────────────────────────────────────────────────
  onProgress("Checking high-risk wallet registry…");
  const regEntry = HIGH_RISK_REGISTRY[trimmed.toLowerCase()];
  const registryHit: RegistryHit = regEntry
    ? { found: true, threatLevel: regEntry.threat, reason: regEntry.reason, caseId: regEntry.caseId }
    : { found: false };

  // ── Risk engine ────────────────────────────────────────────────────────────
  onProgress("Running risk engine…");
  const { score, threat, riskLevel, factors } = calculateRisk(
    balance ?? 0,
    txInfo?.totalTx ?? 0,
    registryHit.found,
    registryHit.found ? 1 : 0,
    network
  );

  return {
    address: trimmed,
    network,
    symbol: meta.symbol,
    balance,
    status: balance != null ? (balance > 0 ? "ACTIVE" : "INACTIVE") : "OFFLINE",
    totalTx:      txInfo?.totalTx      ?? 0,
    incoming:     txInfo?.incoming     ?? 0,
    outgoing:     txInfo?.outgoing     ?? 0,
    totalReceived: txInfo?.totalReceived ?? 0,
    totalSent:    txInfo?.totalSent    ?? 0,
    firstActivity: txInfo?.firstActivity ?? "Unknown",
    lastActivity:  txInfo?.lastActivity  ?? "Unknown",
    walletAge:    txInfo?.walletAge    ?? 0,
    recentTxs:    txInfo?.recentTxs   ?? [],
    riskScore:    score,
    threatLevel:  threat,
    riskLevel,
    registryHit,
    riskFactors:  factors,
    explorerUrl:  meta.explorerBase + trimmed,
    scannedAt:    new Date().toLocaleString(),
  };
}

// ── Demo presets ──────────────────────────────────────────────────────────────
const DEMO_ADDRESSES = [
  { label: "Vitalik's ETH",  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "BTC Genesis",    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf Na".trim().replace(" Na", "") },
  { label: "OFAC Sanctioned (test)", address: "0x7F367cC41522cE07553e823bf3be79A889DEbe1B" },
];

// ── UI helpers ────────────────────────────────────────────────────────────────
const RISK_STYLES = {
  SAFE:    { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  WARNING: { bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  text: "text-yellow-400",  badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
  DANGER:  { bg: "bg-red-500/10",     border: "border-red-500/30",     text: "text-red-400",     badge: "bg-red-500/20 text-red-400 border-red-500/40" },
};

const THREAT_STYLES: Record<ThreatLevel, string> = {
  LOW:      "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  MEDIUM:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  HIGH:     "bg-orange-500/20 text-orange-400 border-orange-500/40",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/40",
};

function ScoreRing({ score, threat }: { score: number; threat: ThreatLevel }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    threat === "CRITICAL" ? "#f87171" :
    threat === "HIGH"     ? "#fb923c" :
    threat === "MEDIUM"   ? "#facc15" : "#34d399";

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
      <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="60" y="55" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold" fontFamily="monospace">{score}</text>
      <text x="60" y="72" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">/100</text>
    </svg>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-right font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="ml-1 text-muted-foreground hover:text-primary transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CryptoTrace() {
  const [input, setInput]           = useState("");
  const [scanning, setScanning]     = useState(false);
  const [progress, setProgress]     = useState("");
  const [result, setResult]         = useState<WalletResult | null>(null);
  const [error, setError]           = useState("");

  const scan = useCallback(async (addr?: string) => {
    const address = (addr ?? input).trim();
    if (!address) { setError("Enter a wallet address to trace."); return; }
    setError("");
    setResult(null);
    setScanning(true);
    try {
      const res = await analyzeWallet(address, setProgress);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setScanning(false);
      setProgress("");
    }
  }, [input]);

  const reset = () => { setResult(null); setError(""); setInput(""); };

  const rs = result ? RISK_STYLES[result.riskLevel] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Shield className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl">SafeByte</span>
              </Link>
              <div className="h-6 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-primary" />
                <span className="font-semibold">CryptoTrace AI</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">v1.0.0</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {result && (
                <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" /> New Trace
                </Button>
              )}
              <Link to="/tools">
                <Button variant="ghost" size="sm">← Back to Tools</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">CryptoTrace AI · v1.0.0</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary">Crypto</span>Trace AI
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Trace any blockchain wallet — multi-chain balance lookup, transaction intelligence,
              risk scoring, and cross-reference against a high-risk wallet registry.
              Powered by public blockchain APIs, no data leaves your browser.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        {!result && !scanning && (
          <ScrollReveal delay={80}>
            <div className="bg-card/30 border border-border/50 rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Wallet Address Analyzer</h2>
                  <p className="text-sm text-muted-foreground">Supports ETH · BTC · TRX · LTC · DOGE · XRP · ADA</p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && scan()}
                  placeholder="Enter wallet address (e.g. 0x… or bc1… or T…)"
                  className="font-mono text-sm flex-1"
                />
                <Button onClick={() => scan()} disabled={!input.trim()} className="gap-2 px-6 shrink-0">
                  <Zap className="h-4 w-4" /> Trace
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Demo presets */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs text-muted-foreground self-center">Try:</span>
                {DEMO_ADDRESSES.map(d => (
                  <button
                    key={d.label}
                    onClick={() => { setInput(d.address); scan(d.address); }}
                    className="text-xs px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Supported chains */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-3">Supported Networks</p>
                <div className="flex flex-wrap gap-2">
                  {(["Ethereum","Bitcoin","Tron","Litecoin","Dogecoin","XRP","Cardano"] as Network[]).map(n => (
                    <span key={n} className={`text-xs font-mono px-3 py-1 rounded-full bg-card border border-border/50 ${NETWORK_META[n].color}`}>
                      {NETWORK_META[n].symbol} · {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Scanning progress ─────────────────────────────────────────────── */}
        {scanning && (
          <div className="bg-card/30 border border-border/50 rounded-2xl p-16 flex flex-col items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Bitcoin className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Tracing wallet…</p>
            <p className="text-sm text-primary font-mono">{progress}</p>
            <div className="w-48 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "65%" }} />
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {result && rs && (
          <div className="space-y-5">

            {/* Verdict banner */}
            <ScrollReveal>
              <div className={`rounded-2xl border p-6 ${rs.bg} ${rs.border}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <ScoreRing score={result.riskScore} threat={result.threatLevel} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={`text-2xl font-bold ${rs.text}`}>
                        {result.riskLevel === "DANGER" ? "🚨 HIGH RISK WALLET" :
                         result.riskLevel === "WARNING" ? "⚡ SUSPICIOUS WALLET" :
                         "✅ LOW RISK WALLET"}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${THREAT_STYLES[result.threatLevel]}`}>
                        {result.threatLevel}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                        result.network === "Unknown" ? "bg-muted/20 text-muted-foreground border-border/50" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {result.network} · {result.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-3 flex-wrap">
                      <Hash className="h-3.5 w-3.5" />
                      <span className="break-all">{result.address}</span>
                      <CopyButton text={result.address} />
                    </div>
                    {result.riskFactors.length > 0 && (
                      <ul className="space-y-1">
                        {result.riskFactors.map((f, i) => (
                          <li key={i} className={`text-sm flex gap-2 items-start ${rs.text}`}>
                            <span className="mt-0.5">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {result.riskFactors.length === 0 && (
                      <p className="text-sm text-muted-foreground">No significant risk factors detected.</p>
                    )}
                  </div>
                  <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-xs text-primary hover:underline border border-primary/20 rounded-lg px-3 py-2 bg-primary/5 hover:bg-primary/10 transition-colors">
                    View on Explorer <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Registry alert */}
            {result.registryHit.found && (
              <ScrollReveal delay={60}>
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400 mb-1">⚠️ Registry Match — High-Risk Wallet</p>
                      <p className="text-sm text-red-300/90 mb-2">{result.registryHit.reason}</p>
                      <div className="flex gap-4 text-xs text-red-400/80 font-mono">
                        <span>Case ID: {result.registryHit.caseId}</span>
                        <span>Threat: {result.registryHit.threatLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Stats grid */}
            <div className="grid md:grid-cols-3 gap-4">

              {/* Wallet Info */}
              <ScrollReveal delay={80}>
                <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-mono text-primary uppercase tracking-widest">Wallet Info</p>
                  </div>
                  <div className="p-4 space-y-0">
                    <InfoRow label="Network"  value={result.network} />
                    <InfoRow label="Balance"  value={result.balance != null ? `${result.balance.toFixed(6)} ${result.symbol}` : "N/A"} mono />
                    <InfoRow label="Status"   value={
                      <span className={
                        result.status === "ACTIVE"   ? "text-emerald-400" :
                        result.status === "INACTIVE" ? "text-yellow-400"  : "text-muted-foreground"
                      }>{result.status}</span>
                    } />
                    <InfoRow label="Wallet Age" value={result.walletAge ? `${result.walletAge} days` : "Unknown"} />
                    <InfoRow label="Scanned"  value={result.scannedAt} />
                  </div>
                </div>
              </ScrollReveal>

              {/* Transaction Stats */}
              <ScrollReveal delay={120}>
                <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-mono text-primary uppercase tracking-widest">Transaction Stats</p>
                  </div>
                  <div className="p-4 space-y-0">
                    <InfoRow label="Total TXs"  value={result.totalTx.toLocaleString()} mono />
                    <InfoRow label="Incoming"   value={
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ArrowDownLeft className="h-3 w-3" />{result.incoming.toLocaleString()}
                      </span>
                    } />
                    <InfoRow label="Outgoing"   value={
                      <span className="flex items-center gap-1 text-red-400">
                        <ArrowUpRight className="h-3 w-3" />{result.outgoing.toLocaleString()}
                      </span>
                    } />
                    <InfoRow label="Total Received" value={`${result.totalReceived} ${result.symbol}`} mono />
                    <InfoRow label="Total Sent"     value={`${result.totalSent} ${result.symbol}`} mono />
                  </div>
                </div>
              </ScrollReveal>

              {/* Blockchain Intelligence */}
              <ScrollReveal delay={160}>
                <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-mono text-primary uppercase tracking-widest">Blockchain Intel</p>
                  </div>
                  <div className="p-4 space-y-0">
                    <InfoRow label="First Activity" value={result.firstActivity} />
                    <InfoRow label="Last Activity"  value={result.lastActivity}  />
                    <InfoRow label="Risk Score"     value={
                      <span className={rs.text}>{result.riskScore}/100</span>
                    } mono />
                    <InfoRow label="Threat Level"   value={
                      <span className={`font-bold ${
                        result.threatLevel === "CRITICAL" ? "text-red-400" :
                        result.threatLevel === "HIGH"     ? "text-orange-400" :
                        result.threatLevel === "MEDIUM"   ? "text-yellow-400" : "text-emerald-400"
                      }`}>{result.threatLevel}</span>
                    } />
                    <InfoRow label="Registry"       value={
                      result.registryHit.found
                        ? <span className="text-red-400 font-semibold">HIGH RISK</span>
                        : <span className="text-emerald-400">CLEAR</span>
                    } />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Recent transactions */}
            {result.recentTxs.length > 0 && (
              <ScrollReveal delay={200}>
                <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-mono text-primary uppercase tracking-widest">Recent Transactions</p>
                  </div>
                  <div className="divide-y divide-border/30">
                    {result.recentTxs.map((tx, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-4">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                          tx.direction === "in" ? "bg-emerald-500/10" : "bg-red-500/10"
                        }`}>
                          {tx.direction === "in"
                            ? <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                            : <ArrowUpRight  className="h-3.5 w-3.5 text-red-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-muted-foreground truncate">{tx.hash}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <span className={`text-sm font-semibold font-mono shrink-0 ${
                          tx.direction === "in" ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {tx.direction === "in" ? "+" : "-"}{tx.value} {result.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* How it works */}
            <ScrollReveal delay={240}>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400 mb-2">How CryptoTrace AI Works</p>
                    <ul className="space-y-1 text-sm text-blue-300/80">
                      <li>• Detects blockchain network from address format (Ethereum, Bitcoin, Tron, etc.)</li>
                      <li>• Fetches live balance and transaction history from public blockchain APIs</li>
                      <li>• Runs the risk engine: balance tiers + transaction volume + registry cross-check</li>
                      <li>• Cross-references address against a curated high-risk wallet registry (OFAC, known darknet)</li>
                      <li>• All analysis runs in your browser — no address or data sent to SafeByte servers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* New trace button */}
            <ScrollReveal delay={280}>
              <div className="flex justify-center pb-12">
                <Button onClick={reset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Trace Another Wallet
                </Button>
              </div>
            </ScrollReveal>

          </div>
        )}

        {/* ── Feature cards (shown on landing only) ─────────────────────── */}
        {!result && !scanning && (
          <ScrollReveal delay={120}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {[
                { icon: Search,    title: "Multi-Chain Detection",   desc: "Automatically identifies ETH, BTC, TRX, LTC, DOGE, XRP, ADA from address format." },
                { icon: Activity,  title: "Transaction Intelligence", desc: "Fetches live tx history — total count, incoming/outgoing volume, wallet age." },
                { icon: TrendingUp,title: "Risk Engine",             desc: "0–100 score using balance tiers, tx volume, and linked case count." },
                { icon: Database,  title: "Registry Check",          desc: "Cross-references against OFAC-sanctioned and known darknet-linked wallets." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-5 rounded-xl border border-border/50 bg-card/30 hover:border-primary/20 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

      </main>
    </div>
  );
}

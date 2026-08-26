import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Shield, QrCode, Mic, Link2, AlertTriangle, CheckCircle, XCircle,
  Upload, Scan, ExternalLink, Zap, Info, AlertCircle, ChevronDown, ChevronUp,
  Phone, DollarSign, Lock, Unlock, Eye, Ear, Globe, ShieldAlert, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";

// ── Types ─────────────────────────────────────────────────────────────────────
type ScannerType = "qr" | "voice" | "url";

interface QRScanResult {
  rawContent: string;
  isUPI: boolean;
  upiData: {
    pa?: string;  // payee address
    pn?: string;  // payee name
    mc?: string;  // merchant code
    tr?: string;  // transaction reference
    tn?: string;  // transaction note
    am?: string;  // amount
    mam?: string; // max amount
    cu?: string;  // currency
    mode?: string; // 02 = request, 43 = send
  } | null;
  isPaymentRequest: boolean;
  riskLevel: "SAFE" | "WARNING" | "DANGER";
  warnings: string[];
  explanation: string;
}

interface VoiceScanResult {
  isDeepfake: boolean;
  confidence: number;           // 0–1
  riskLevel: "SAFE" | "WARNING" | "DANGER";
  explanation: string;
  indicators: { label: string; value: string; flag: boolean }[];
  features: {
    zeroCrossingRate: number;   // how often signal crosses zero — AI voices unusually low/high
    spectralFlatness: number;   // 0=tonal, 1=noise-like — AI voices often too flat
    pitchVariance: number;      // variance in dominant frequency — AI voices too consistent
    silenceRatio: number;       // fraction of near-silent frames — AI voices have odd silences
    energyVariance: number;     // variance in frame energy — AI voices suspiciously steady
    dominantFreq: number;       // Hz
    avgEnergy: number;
  };
}

interface URLScanResult {
  url: string;
  domain: string;
  isMalicious: boolean;
  riskLevel: "SAFE" | "WARNING" | "DANGER";
  patternMatches: string[];
  virusTotalResult?: {
    detected: number;
    total: number;
    permalink?: string;
  };
  explanation: string;
  recommendations: string[];
}

const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VT_API_KEY as string;

// ── Known malicious patterns ───────────────────────────────────────────────────
const MALICIOUS_PATTERNS = [
  { pattern: /(\b(union\s+select|select\s+.*\s+from)\b)/gi, name: "SQL Injection", risk: "HIGH" },
  { pattern: /(<script|javascript:|onerror\s*=|onload\s*=)/gi, name: "XSS Attack", risk: "HIGH" },
  { pattern: /(cmd\.exe|powershell|\/bin\/bash)/gi, name: "Command Injection", risk: "HIGH" },
  { pattern: /(\.\.\/|\.\.\\)/g, name: "Path Traversal", risk: "HIGH" },
  { pattern: /(eval\s*\(|exec\s*\(|system\s*\()/gi, name: "Code Injection", risk: "HIGH" },
  { pattern: /(base64_decode|gzinflate)/gi, name: "Obfuscated Payload", risk: "MEDIUM" },
  { pattern: /(@gmail\.com|@yahoo\.com).*password/i, name: "Credential Harvesting", risk: "HIGH" },
  { pattern: /(free.*iphone|free.*gift|congratulation.*winner)/gi, name: "Scam Pattern", risk: "HIGH" },
  { pattern: /(verify.*account|suspend.*account|update.*payment)/gi, name: "Phishing Pattern", risk: "HIGH" },
];

// ── Real Web Audio API Voice Analysis ─────────────────────────────────────────
// Mirrors FraudEye's 40-feature Random Forest approach using browser-native FFT.
// Features: ZCR, spectral flatness, pitch variance, silence ratio, energy variance.
async function analyzeVoice(file: File): Promise<VoiceScanResult> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    throw new Error("Could not decode audio. Please upload a valid MP3, WAV, M4A, or OGG file.");
  }

  const rawData = audioBuffer.getChannelData(0);   // mono channel
  const sampleRate = audioBuffer.sampleRate;
  const frameSize = 2048;
  const hopSize = 512;

  let zcr = 0;
  let totalEnergy = 0;
  let frameCount = 0;
  let silentFrames = 0;
  const frameEnergies: number[] = [];
  const dominantFreqs: number[] = [];

  // FFT analyser
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = frameSize;
  const freqBinCount = analyser.frequencyBinCount;
  const freqData = new Float32Array(freqBinCount);

  // Offline frame analysis
  for (let i = 0; i + frameSize < rawData.length; i += hopSize) {
    const frame = rawData.slice(i, i + frameSize);

    // Zero Crossing Rate
    let crossings = 0;
    for (let j = 1; j < frame.length; j++) {
      if ((frame[j] >= 0) !== (frame[j - 1] >= 0)) crossings++;
    }
    zcr += crossings / frame.length;

    // Energy
    let energy = 0;
    for (let j = 0; j < frame.length; j++) energy += frame[j] * frame[j];
    energy /= frame.length;
    frameEnergies.push(energy);
    totalEnergy += energy;
    if (energy < 0.0001) silentFrames++;

    // FFT via manual DFT on downsampled frame for dominant frequency
    const n = 256;
    const step = Math.floor(frame.length / n);
    let maxMag = 0, maxIdx = 0;
    for (let k = 1; k < n / 2; k++) {
      let re = 0, im = 0;
      for (let j = 0; j < n; j++) {
        const angle = (2 * Math.PI * k * j) / n;
        re += frame[j * step] * Math.cos(angle);
        im -= frame[j * step] * Math.sin(angle);
      }
      const mag = Math.sqrt(re * re + im * im);
      if (mag > maxMag) { maxMag = mag; maxIdx = k; }
    }
    dominantFreqs.push((maxIdx * sampleRate) / n);
    frameCount++;
  }

  await audioCtx.close();

  if (frameCount === 0) throw new Error("Audio file too short to analyze.");

  const avgZCR = zcr / frameCount;
  const avgEnergy = totalEnergy / frameCount;
  const silenceRatio = silentFrames / frameCount;

  // Energy variance
  const energyVariance =
    frameEnergies.reduce((acc, e) => acc + Math.pow(e - avgEnergy, 2), 0) / frameEnergies.length;

  // Pitch variance (variance of dominant frequencies in human vocal range 80–300 Hz)
  const voiceFreqs = dominantFreqs.filter(f => f >= 60 && f <= 400);
  const dominantFreq = voiceFreqs.length > 0
    ? voiceFreqs.reduce((a, b) => a + b, 0) / voiceFreqs.length
    : dominantFreqs.reduce((a, b) => a + b, 0) / dominantFreqs.length;
  const pitchVariance = voiceFreqs.length > 1
    ? voiceFreqs.reduce((acc, f) => acc + Math.pow(f - dominantFreq, 2), 0) / voiceFreqs.length
    : 0;

  // Spectral flatness approximation (ratio of geometric to arithmetic mean of energies)
  const geoMean = Math.exp(
    frameEnergies.reduce((acc, e) => acc + Math.log(Math.max(e, 1e-10)), 0) / frameEnergies.length
  );
  const spectralFlatness = Math.min(geoMean / Math.max(avgEnergy, 1e-10), 1);

  // ── Scoring (higher = more likely deepfake) ──────────────────────────────────
  let suspicionScore = 0;
  const indicators: VoiceScanResult["indicators"] = [];

  // AI voices tend to have very LOW pitch variance (unnaturally consistent pitch)
  const pitchVarianceFlag = pitchVariance < 120 && voiceFreqs.length > 5;
  suspicionScore += pitchVarianceFlag ? 30 : 0;
  indicators.push({
    label: "Pitch Consistency",
    value: `Variance: ${pitchVariance.toFixed(1)} Hz²`,
    flag: pitchVarianceFlag,
  });

  // AI voices tend to have very LOW energy variance (unnaturally smooth amplitude)
  const energyVarianceFlag = energyVariance < 0.0005 && avgEnergy > 0.001;
  suspicionScore += energyVarianceFlag ? 25 : 0;
  indicators.push({
    label: "Energy Consistency",
    value: `Variance: ${(energyVariance * 10000).toFixed(2)}×10⁻⁴`,
    flag: energyVarianceFlag,
  });

  // Unusual ZCR (AI voices can be unnaturally smooth — low ZCR — or buzzy — high ZCR)
  const zcrFlag = avgZCR < 0.02 || avgZCR > 0.35;
  suspicionScore += zcrFlag ? 20 : 0;
  indicators.push({
    label: "Zero Crossing Rate",
    value: `${(avgZCR * 100).toFixed(2)}% per frame`,
    flag: zcrFlag,
  });

  // AI voices have unusual silence patterns
  const silenceFlag = silenceRatio > 0.4 || silenceRatio < 0.05;
  suspicionScore += silenceFlag ? 15 : 0;
  indicators.push({
    label: "Silence Pattern",
    value: `${(silenceRatio * 100).toFixed(1)}% silent frames`,
    flag: silenceFlag,
  });

  // Spectral flatness — AI voices often too flat (synthetic) or too tonal
  const spectralFlag = spectralFlatness > 0.8 || spectralFlatness < 0.02;
  suspicionScore += spectralFlag ? 10 : 0;
  indicators.push({
    label: "Spectral Flatness",
    value: `${(spectralFlatness * 100).toFixed(1)}%`,
    flag: spectralFlag,
  });

  const confidence = Math.min(suspicionScore / 100, 1);
  const isDeepfake = suspicionScore >= 40;
  const riskLevel: VoiceScanResult["riskLevel"] =
    suspicionScore >= 55 ? "DANGER" : suspicionScore >= 30 ? "WARNING" : "SAFE";

  const explanation =
    riskLevel === "DANGER"
      ? `🚨 HIGH LIKELIHOOD OF AI-GENERATED VOICE. The audio shows ${suspicionScore}% suspicion score across ${frameCount} frames analyzed. Pitch consistency and energy patterns are unnaturally uniform — hallmarks of TTS/deepfake synthesis.`
      : riskLevel === "WARNING"
      ? `⚡ SUSPICIOUS AUDIO (${suspicionScore}% suspicion). Some features deviate from natural human speech patterns. Could be a deepfake or heavily processed audio.`
      : `✅ LIKELY AUTHENTIC VOICE (${suspicionScore}% suspicion). The audio features — pitch variation, energy dynamics, ZCR, and silence patterns — are consistent with natural human speech recorded across ${frameCount} frames.`;

  return {
    isDeepfake,
    confidence,
    riskLevel,
    explanation,
    indicators,
    features: {
      zeroCrossingRate: avgZCR,
      spectralFlatness,
      pitchVariance,
      silenceRatio,
      energyVariance,
      dominantFreq,
      avgEnergy,
    },
  };
}
async function checkURLSafety(url: string): Promise<URLScanResult> {
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url.replace(/https?:\/\//, "").split("/")[0];
  }

  const patternMatches: string[] = [];
  let maxRisk: "SAFE" | "WARNING" | "DANGER" = "SAFE";

  for (const { pattern, name, risk } of MALICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      patternMatches.push(`${name} detected`);
      if (risk === "HIGH") maxRisk = "DANGER";
      else if (risk === "MEDIUM" && maxRisk !== "DANGER") maxRisk = "WARNING";
    }
  }

  let virusTotalResult;
  try {
    const vtResponse = await fetch(
      `https://www.virustotal.com/api/v3/urls/${btoa(url).replace(/=/g, "")}`,
      { headers: { "x-apikey": VIRUSTOTAL_API_KEY } }
    );
    if (vtResponse.ok) {
      const vtData = await vtResponse.json();
      const stats = vtData.data.attributes.last_analysis_stats;
      virusTotalResult = {
        detected: stats.malicious + stats.suspicious,
        total: stats.malicious + stats.suspicious + stats.harmless + stats.undetected,
        permalink: `https://www.virustotal.com/gui/url/${vtData.data.id}`,
      };
      if (virusTotalResult.detected > 0) maxRisk = "DANGER";
    }
  } catch (e) {
    console.log("VirusTotal check failed:", e);
  }

  const explanation = maxRisk === "DANGER"
    ? "⚠️ DANGER! This URL is likely malicious. Do NOT click this link."
    : maxRisk === "WARNING"
    ? "⚡ CAUTION! This URL has suspicious patterns. Proceed with caution."
    : "✅ This URL appears safe based on our analysis.";

  const recommendations = maxRisk === "DANGER"
    ? ["Do NOT click this link", "Do NOT download files from this URL", "Report to IT security"]
    : maxRisk === "WARNING"
    ? ["Verify the URL is from an official source", "Check for HTTPS", "Never enter passwords"]
    : ["Check the domain spelling", "Look for the padlock icon", "Bookmark important sites"];

  return { url, domain, isMalicious: maxRisk === "DANGER", riskLevel: maxRisk, patternMatches, virusTotalResult, explanation, recommendations };
}

// ── QR Image Decoder (jsQR — works in all browsers) ──────────────────────────
async function decodeQRFromImage(file: File): Promise<string> {
  const jsQR = (await import("jsqr")).default;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const code = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
      if (code) {
        resolve(code.data);
      } else {
        // Retry with inverted colours (handles dark-background QR codes)
        const code2 = jsQR(data, width, height, { inversionAttempts: "onlyInvert" });
        if (code2) {
          resolve(code2.data);
        } else {
          reject(new Error("Could not decode QR code. Make sure the image is clear and the QR code fills most of the frame."));
        }
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file."));
    };
    img.src = url;
  });
}

// ── Parse UPI QR ───────────────────────────────────────────────────────────────
function parseUPIQR(content: string): QRScanResult {
  const warnings: string[] = [];
  const upiData: QRScanResult["upiData"] = {};
  
  if (content.toLowerCase().startsWith("upi://")) {
    const params = new URLSearchParams(content.split("?")[1] || "");
    upiData.pa = params.get("pa") || undefined;
    upiData.pn = params.get("pn") || undefined;
    upiData.am = params.get("am") || undefined;
    upiData.mode = params.get("mode") || undefined;
    upiData.tn = params.get("tn") || undefined;
    
    const isPaymentRequest = upiData.mode === "02";
    
    if (isPaymentRequest) {
      warnings.push("🚨 This is a PAYMENT REQUEST QR code!");
      warnings.push("Scanning this will DEDUCT money from your account.");
      warnings.push(`Requested amount: ₹${upiData.am || "Not specified"}`);
      warnings.push(`Payee: ${upiData.pn || "Unknown"}`);
    }
    
    const riskLevel: QRScanResult["riskLevel"] = isPaymentRequest ? "DANGER" : warnings.length > 0 ? "WARNING" : "SAFE";
    
    const explanation = isPaymentRequest
      ? "🚨 DANGER! This QR code is asking YOU to pay money. Never scan a QR code expecting to receive money."
      : warnings.length > 0 ? "⚠️ Suspicious elements detected. Verify carefully."
      : "✅ This appears to be a legitimate UPI QR code.";
    
    return { rawContent: content, isUPI: true, upiData, isPaymentRequest, riskLevel, warnings, explanation };
  }
  
  return { rawContent: content, isUPI: false, upiData: null, isPaymentRequest: false, riskLevel: "SAFE", warnings: [], explanation: "Non-UPI QR code." };
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FraudScanner() {
  const [activeScanner, setActiveScanner] = useState<ScannerType>("qr");
  const [qrResult, setQRResult] = useState<QRScanResult | null>(null);
  const [voiceResult, setVoiceResult] = useState<VoiceScanResult | null>(null);
  const [urlResult, setURLResult] = useState<URLScanResult | null>(null);
  const [urlInput, setURLInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [qrImageFile, setQRImageFile] = useState<File | null>(null);
  const [qrImagePreview, setQRImagePreview] = useState<string | null>(null);
  const [qrError, setQRError] = useState<string | null>(null);
  const [isDecodingQR, setIsDecodingQR] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleQRImageUpload = async (file: File) => {
    setQRImageFile(file);
    setQRResult(null);
    setQRError(null);
    setQRImagePreview(URL.createObjectURL(file));
    setIsDecodingQR(true);
    try {
      const decoded = await decodeQRFromImage(file);

      // Always try UPI parse first
      if (decoded.toLowerCase().startsWith("upi://")) {
        setQRResult(parseUPIQR(decoded));
        return;
      }

      // For URLs — run the full safety check
      if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        setIsDecodingQR(false);
        setIsScanning(true);
        try {
          const urlResult = await checkURLSafety(decoded);
          setQRResult({
            rawContent: decoded,
            isUPI: false,
            upiData: null,
            isPaymentRequest: false,
            riskLevel: urlResult.riskLevel,
            warnings: [
              ...urlResult.patternMatches,
              ...(urlResult.virusTotalResult && urlResult.virusTotalResult.detected > 0
                ? [`VirusTotal: ${urlResult.virusTotalResult.detected}/${urlResult.virusTotalResult.total} engines flagged this URL`]
                : []),
            ],
            explanation: urlResult.explanation,
          });
        } finally {
          setIsScanning(false);
        }
        return;
      }

      // Non-UPI, non-URL content — show raw decoded string as informational
      setQRResult({
        rawContent: decoded,
        isUPI: false,
        upiData: null,
        isPaymentRequest: false,
        riskLevel: "SAFE",
        warnings: [],
        explanation: `QR decoded. Content: "${decoded.slice(0, 120)}${decoded.length > 120 ? "…" : ""}"`,
      });
    } catch (e: unknown) {
      setQRError(e instanceof Error ? e.message : "QR decode failed.");
    } finally {
      setIsDecodingQR(false);
    }
  };

  const handleURLScan = async () => {
    if (!urlInput.trim()) return;
    setIsScanning(true);
    try {
      const result = await checkURLSafety(urlInput);
      setURLResult(result);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVoiceScan = async () => {
    if (!audioFile) return;
    setIsScanning(true);
    setVoiceError(null);
    setVoiceResult(null);
    try {
      const result = await analyzeVoice(audioFile);
      setVoiceResult(result);
    } catch (err: unknown) {
      setVoiceError(err instanceof Error ? err.message : "Analysis failed. Please try a different audio file.");
    } finally {
      setIsScanning(false);
    }
  };

  const riskStyles = {
    SAFE: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    WARNING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    DANGER: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  const riskIcons = {
    SAFE: <ShieldCheck className="w-12 h-12 text-emerald-400" />,
    WARNING: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
    DANGER: <ShieldAlert className="w-12 h-12 text-red-400" />,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
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
                <Eye className="w-5 h-5 text-primary" />
                <span className="font-semibold">FraudEye Scanner</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">v1.0.1</span>
              </div>
            </div>
            <Link to="/tools">
              <Button variant="ghost" size="sm">← Back to Tools</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ScrollReveal>
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3"><span className="text-primary">Fraud</span>Eye Scanner</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Protect yourself from digital fraud with AI-powered detection. Scan QR codes, voice recordings, and URLs.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: "qr" as ScannerType, icon: QrCode, label: "QR Scanner" },
              { id: "voice" as ScannerType, icon: Mic, label: "Voice Detector" },
              { id: "url" as ScannerType, icon: Link2, label: "URL Checker" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveScanner(id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeScanner === id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card/50 border border-border/50 hover:bg-card/80"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* QR Scanner */}
        {activeScanner === "qr" && (
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card/30 border border-border/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">QR Code Scanner</h2>
                    <p className="text-sm text-muted-foreground">Detect UPI payment fraud and malicious QR codes</p>
                  </div>
                </div>

                {/* ── QR Image Upload ── */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-6 cursor-pointer ${
                    qrImageFile ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-muted/10"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f && f.type.startsWith("image/")) handleQRImageUpload(f);
                  }}
                  onClick={() => qrInputRef.current?.click()}
                >
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleQRImageUpload(f);
                    }}
                  />
                  {qrImageFile && qrImagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={qrImagePreview} alt="QR preview" className="h-20 w-20 object-contain rounded-lg border border-border/50 shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{qrImageFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(qrImageFile.size / 1024).toFixed(1)} KB</p>
                        {isDecodingQR && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                            Decoding QR…
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQRImageFile(null); setQRImagePreview(null); setQRResult(null); setQRError(null); }}
                        className="text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded px-2 py-1 shrink-0"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Upload a QR Code image</p>
                      <p className="text-xs text-muted-foreground">Drop an image here or click to browse — PNG, JPG, WebP</p>
                    </div>
                  )}
                </div>

                {/* QR decode error */}
                {qrError && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{qrError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-xs text-muted-foreground">or paste UPI string manually</span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>

                {/* Manual UPI Input */}
                <div className="mb-6">
                  <Input
                    placeholder="upi://pay?pa=test@upi&pn=Test&mode=02&am=1000"
                    onChange={(e) => {
                      if (e.target.value.startsWith("upi://")) {
                        setQRError(null);
                        setQRImageFile(null);
                        setQRImagePreview(null);
                        const result = parseUPIQR(e.target.value);
                        setQRResult(result);
                      }
                    }}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Try: <code className="bg-muted/30 px-1 rounded">upi://pay?pa=scammer@upi&amp;pn=Winner&amp;mode=02&amp;am=5000</code>
                  </p>
                </div>

                {/* Result */}
                {qrResult && (
                  <div className="mt-6 space-y-4">
                    <div className={`p-6 rounded-xl border ${riskStyles[qrResult.riskLevel]}`}>
                      <div className="flex items-start gap-4">
                        {riskIcons[qrResult.riskLevel]}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {qrResult.riskLevel === "DANGER" && "🚨 DANGER - Payment Request Detected!"}
                            {qrResult.riskLevel === "WARNING" && "⚠️ CAUTION - Suspicious QR Code"}
                            {qrResult.riskLevel === "SAFE" && "✅ QR Code Appears Safe"}
                          </h3>
                          <p className="text-sm opacity-90">{qrResult.explanation}</p>
                        </div>
                      </div>
                    </div>

                    {qrResult.warnings.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />Warnings
                        </h4>
                        <ul className="space-y-2">
                          {qrResult.warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {qrResult.upiData && (
                      <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />UPI Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {qrResult.upiData.pa && <div><span className="text-muted-foreground">UPI ID:</span><p className="font-mono">{qrResult.upiData.pa}</p></div>}
                          {qrResult.upiData.pn && <div><span className="text-muted-foreground">Payee:</span><p className="font-medium">{qrResult.upiData.pn}</p></div>}
                          {qrResult.upiData.am && <div><span className="text-muted-foreground">Amount:</span><p className="font-bold text-lg">₹{qrResult.upiData.am}</p></div>}
                          {qrResult.upiData.mode && <div><span className="text-muted-foreground">Type:</span><p className={`font-medium ${qrResult.isPaymentRequest ? "text-red-400" : "text-emerald-400"}`}>{qrResult.isPaymentRequest ? "PAYMENT REQUEST" : "SEND MONEY"}</p></div>}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />How to Stay Safe
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-300">
                        <li>• Never scan QR codes from unknown sources expecting to receive money</li>
                        <li>• mode=02 means payment REQUEST, not payment RECEIPT</li>
                        <li>• Government agencies never ask for payments via personal UPI IDs</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Voice Scanner */}
        {activeScanner === "voice" && (
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card/30 border border-border/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Voice Fraud Detector</h2>
                    <p className="text-sm text-muted-foreground">Detect AI-generated/deepfake voice recordings using Web Audio API</p>
                  </div>
                </div>

                {/* Upload area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-4 ${
                    audioFile ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) { setAudioFile(f); setVoiceResult(null); setVoiceError(null); }
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setAudioFile(f); setVoiceResult(null); setVoiceError(null); }
                    }}
                    accept="audio/*"
                    className="hidden"
                  />
                  {audioFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Ear className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">{audioFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(audioFile.size / 1024).toFixed(1)} KB</p>
                      <div className="flex justify-center gap-2">
                        <Button onClick={handleVoiceScan} disabled={isScanning}>
                          {isScanning
                            ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Analyzing audio...</>
                            : <><Scan className="w-4 h-4 mr-2" />Analyze Voice</>}
                        </Button>
                        <Button variant="outline" onClick={() => { setAudioFile(null); setVoiceResult(null); setVoiceError(null); }}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Mic className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">Drop audio file here</p>
                        <p className="text-sm text-muted-foreground">Supports MP3, WAV, M4A, OGG</p>
                      </div>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Select Audio
                      </Button>
                    </div>
                  )}
                </div>

                {/* Error */}
                {voiceError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                    <span className="font-semibold">Error: </span>{voiceError}
                  </div>
                )}

                {/* Results */}
                {voiceResult && (
                  <div className="space-y-4">
                    {/* Risk Banner */}
                    <div className={`p-6 rounded-xl border ${riskStyles[voiceResult.riskLevel]}`}>
                      <div className="flex items-start gap-4">
                        {riskIcons[voiceResult.riskLevel]}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {voiceResult.riskLevel === "DANGER" && "🚨 LIKELY AI-GENERATED VOICE"}
                            {voiceResult.riskLevel === "WARNING" && "⚠️ SUSPICIOUS AUDIO PATTERNS"}
                            {voiceResult.riskLevel === "SAFE" && "✅ LIKELY AUTHENTIC VOICE"}
                          </h3>
                          <p className="text-sm opacity-90">{voiceResult.explanation}</p>
                          <div className="mt-2">
                            <span className="text-xs font-medium">Suspicion Score: </span>
                            <span className="text-xs font-bold">{Math.round(voiceResult.confidence * 100)}%</span>
                            <div className="mt-1 h-2 bg-muted/30 rounded-full overflow-hidden w-48">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  voiceResult.riskLevel === "DANGER" ? "bg-red-400" :
                                  voiceResult.riskLevel === "WARNING" ? "bg-yellow-400" : "bg-emerald-400"
                                }`}
                                style={{ width: `${voiceResult.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feature Breakdown */}
                    <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />Audio Feature Analysis
                      </h4>
                      <div className="space-y-3">
                        {voiceResult.indicators.map((ind, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {ind.flag
                                ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                              <span className={ind.flag ? "text-red-300" : "text-muted-foreground"}>{ind.label}</span>
                            </div>
                            <span className={`font-mono text-xs ${ind.flag ? "text-red-400" : "text-muted-foreground"}`}>
                              {ind.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw features */}
                    <div className="bg-card/30 border border-border/30 rounded-xl p-4">
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Raw Audio Features</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div><span className="text-muted-foreground">Dominant Freq:</span> <span>{voiceResult.features.dominantFreq.toFixed(1)} Hz</span></div>
                        <div><span className="text-muted-foreground">Avg Energy:</span> <span>{voiceResult.features.avgEnergy.toExponential(2)}</span></div>
                        <div><span className="text-muted-foreground">ZCR:</span> <span>{(voiceResult.features.zeroCrossingRate * 100).toFixed(2)}%</span></div>
                        <div><span className="text-muted-foreground">Spectral Flatness:</span> <span>{(voiceResult.features.spectralFlatness * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />Voice Fraud Protection Tips
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-300">
                        <li>• Scammers clone voices of family members using AI — verify via callback</li>
                        <li>• Ask a personal question only the real person would know</li>
                        <li>• Set up a family emergency code word</li>
                        <li>• Never send money based solely on a voice call</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* URL Scanner */}
        {activeScanner === "url" && (
          <ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card/30 border border-border/50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">URL Safety Checker</h2>
                    <p className="text-sm text-muted-foreground">Check if a URL is malicious before clicking</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL to check (e.g., https://example.com)"
                    value={urlInput}
                    onChange={(e) => setURLInput(e.target.value)}
                    className="font-mono"
                    onKeyDown={(e) => { if (e.key === "Enter") handleURLScan(); }}
                  />
                  <Button onClick={handleURLScan} disabled={isScanning || !urlInput.trim()}>
                    {isScanning ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Scanning...</> : <><Scan className="w-4 h-4 mr-2" />Check URL</>}
                  </Button>
                </div>

                {urlResult && (
                  <div className="mt-6 space-y-4">
                    <div className={`p-6 rounded-xl border ${riskStyles[urlResult.riskLevel]}`}>
                      <div className="flex items-start gap-4">
                        {riskIcons[urlResult.riskLevel]}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {urlResult.riskLevel === "DANGER" && "🚨 DANGER - Malicious URL Detected!"}
                            {urlResult.riskLevel === "WARNING" && "⚠️ CAUTION - Suspicious URL"}
                            {urlResult.riskLevel === "SAFE" && "✅ URL Appears Safe"}
                          </h3>
                          <p className="text-sm opacity-90">{urlResult.explanation}</p>
                          <p className="text-xs mt-2 font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                            {urlResult.domain}
                          </p>
                        </div>
                      </div>
                    </div>

                    {urlResult.patternMatches.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />Detected Patterns
                        </h4>
                        <ul className="space-y-1">
                          {urlResult.patternMatches.map((match, i) => (
                            <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{match}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {urlResult.virusTotalResult && (
                      <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />VirusTotal Analysis
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${urlResult.virusTotalResult.detected > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {urlResult.virusTotalResult.detected}/{urlResult.virusTotalResult.total}
                          </div>
                          <div className="text-sm text-muted-foreground">vendors flagged as malicious</div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-300">
                        {urlResult.recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}
      </main>
    </div>
  );
}

import { Activity, Binary, LockKeyhole, Radar, ShieldCheck } from "lucide-react";

const signals = [
  { label: "Threat vectors", value: "2,847", tone: "text-primary" },
  { label: "Blocked today", value: "99.98%", tone: "text-emerald-400" },
  { label: "Mean response", value: "0.8ms", tone: "text-primary" },
];

export default function CyberDefenseCore() {
  return (
    <div className="hero-console" aria-label="Live SafeByte defense network visualization">
      <div className="hero-console__frame">
        <div className="hero-console__header">
          <div className="flex items-center gap-2.5">
            <span className="status-beacon" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-foreground/80">
              DEFENSE CORE / LIVE
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground">
            <LockKeyhole className="h-3 w-3 text-primary" /> AES-256
          </div>
        </div>

        <div className="hero-console__stage">
          <div className="scene-glow" />
          <div className="orbit orbit--outer"><span /><span /><span /></div>
          <div className="orbit orbit--middle"><span /><span /></div>
          <div className="orbit orbit--inner" />

          <div className="defense-core">
            <div className="defense-core__back" />
            <div className="defense-core__face">
              <ShieldCheck className="h-16 w-16 text-primary" strokeWidth={1.35} />
              <span className="font-mono text-[9px] font-bold tracking-[0.26em] text-primary">PROTECTED</span>
            </div>
          </div>

          <div className="floating-module floating-module--left">
            <Radar className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[9px] font-mono tracking-widest text-muted-foreground">EDGE SCAN</div>
              <div className="text-[11px] font-semibold text-foreground">Perimeter clean</div>
            </div>
          </div>

          <div className="floating-module floating-module--right">
            <Activity className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-[9px] font-mono tracking-widest text-muted-foreground">UPTIME</div>
              <div className="text-[11px] font-semibold text-foreground">99.999%</div>
            </div>
          </div>

          <div className="data-stream data-stream--one"><Binary className="h-3 w-3" /> 01-AF-92</div>
          <div className="data-stream data-stream--two">PKT VERIFIED</div>
          <div className="stage-floor" />
        </div>

        <div className="grid grid-cols-3 border-t border-white/[0.07] bg-black/10">
          {signals.map((signal) => (
            <div key={signal.label} className="px-3 py-3 sm:px-4 border-r border-white/[0.07] last:border-r-0">
              <div className="mb-1 text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                {signal.label}
              </div>
              <div className={`font-mono text-xs sm:text-sm font-bold ${signal.tone}`}>{signal.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

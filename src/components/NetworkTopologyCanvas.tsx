import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  type: "perimeter" | "core" | "sentinel" | "gateway";
  pulse: number;
  status: "secure" | "inspecting" | "intercepting";
}

interface Packet {
  source: number;
  target: number;
  progress: number;
  speed: number;
  color: string;
}

export default function NetworkTopologyCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>("CORE-GATEWAY-01");
  const [packetsCount, setPacketsCount] = useState(1420);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 800);
    let height = (canvas.height = containerRef.current?.clientHeight || 450);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const labels = [
      { label: "SOC-GATEWAY-01", type: "gateway" as const },
      { label: "DMZ-FIREWALL-ALPHA", type: "perimeter" as const },
      { label: "CORE-DATABASE-VAULT", type: "core" as const },
      { label: "AI-THREAT-SENTINEL", type: "sentinel" as const },
      { label: "K8S-CLUSTER-INGRESS", type: "perimeter" as const },
      { label: "CRYPTO-VAULT-NODE", type: "core" as const },
      { label: "ZERO-TRUST-BROKER", type: "sentinel" as const },
      { label: "SIEM-ANALYTICS-HUB", type: "gateway" as const },
    ];

    const nodes: Node[] = labels.map((l, i) => {
      const angle = (i / labels.length) * Math.PI * 2;
      const dist = Math.min(width, height) * 0.32;
      return {
        x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: l.type === "core" ? 7 : 5,
        label: l.label,
        type: l.type,
        pulse: Math.random() * Math.PI * 2,
        status: i === 3 ? "inspecting" : "secure",
      };
    });

    // Generate packets traversing between connected nodes
    const packets: Packet[] = [];
    for (let i = 0; i < 14; i++) {
      const src = Math.floor(Math.random() * nodes.length);
      let tgt = Math.floor(Math.random() * nodes.length);
      while (tgt === src) tgt = Math.floor(Math.random() * nodes.length);
      packets.push({
        source: src,
        target: tgt,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        color: Math.random() > 0.85 ? "#F59E0B" : "#0284C7",
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", onMouseMove);

    // Render loop
    const render = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "0, 229, 255" : "2, 132, 199";

      ctx.clearRect(0, 0, width, height);

      // Draw cyber subtle coordinate background grid inside canvas
      ctx.strokeStyle = `rgba(${primaryColor}, ${isDark ? 0.04 : 0.06})`;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw node connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260) {
            const alpha = (1 - dist / 260) * (isDark ? 0.25 : 0.3);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update & draw packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.source = Math.floor(Math.random() * nodes.length);
          let nextTgt = Math.floor(Math.random() * nodes.length);
          while (nextTgt === p.source) nextTgt = Math.floor(Math.random() * nodes.length);
          p.target = nextTgt;
        }

        const srcNode = nodes[p.source];
        const tgtNode = nodes[p.target];
        if (!srcNode || !tgtNode) return;

        const curX = srcNode.x + (tgtNode.x - srcNode.x) * p.progress;
        const curY = srcNode.y + (tgtNode.y - srcNode.y) * p.progress;

        const packetColor = p.color === "#F59E0B" ? "#F59E0B" : isDark ? "#00E5FF" : "#0284C7";

        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = packetColor;
        ctx.shadowColor = packetColor;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update & Draw Nodes
      let hoveredNode: Node | null = null;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.04;

        if (n.x < 40 || n.x > width - 40) n.vx *= -1;
        if (n.y < 40 || n.y > height - 40) n.vy *= -1;

        const mDist = Math.hypot(n.x - mouseX, n.y - mouseY);
        const isHovered = mDist < 25;
        if (isHovered) {
          hoveredNode = n;
        }

        const nodeColor = n.status === "inspecting" ? "#F59E0B" : isDark ? "#00E5FF" : "#0284C7";

        // Concentric radar pulse ring
        const pulseSize = n.radius + Math.sin(n.pulse) * 4 + 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = n.status === "inspecting"
          ? "rgba(245, 158, 11, 0.3)"
          : isHovered
          ? `rgba(${primaryColor}, 0.8)`
          : `rgba(${primaryColor}, 0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node inner core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isHovered ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isHovered ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = isHovered
          ? (isDark ? "#00E5FF" : "#0284C7")
          : isDark
          ? "rgba(239, 243, 248, 0.75)"
          : "rgba(15, 23, 42, 0.85)";
        ctx.font = isHovered ? "bold 11px 'JetBrains Mono', monospace" : "10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + n.radius + 14);
      });

      if (hoveredNode) {
        setActiveNode((hoveredNode as Node).label);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const packetInterval = setInterval(() => {
      setPacketsCount((c) => c + Math.floor(Math.random() * 7 + 3));
    }, 1200);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      clearInterval(packetInterval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[380px] md:h-[460px] rounded-xl border border-border bg-card/90 backdrop-blur-md overflow-hidden shadow-2xl ${className}`}
    >
      {/* Top Telemetry Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/85 backdrop-blur text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-foreground/90 font-semibold tracking-wider">TOPOLOGY TELEMETRY</span>
          <span className="text-muted-foreground hidden sm:inline">| MESH ACTIVE</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
            <span>INSPECTED:</span>
            <span className="text-primary font-mono font-bold">{packetsCount.toLocaleString()} pkts/s</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
            <span>NODE:</span>
            <span className="font-bold truncate max-w-[140px]">{activeNode}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border bg-background/85 backdrop-blur text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> GATEWAY NODES (8)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> THREAT PROBES (ACTIVE)
          </span>
        </div>
        <div className="text-primary/90 font-medium">LATENCY: 0.8ms · PACKET LOSS: 0.00%</div>
      </div>
    </div>
  );
}

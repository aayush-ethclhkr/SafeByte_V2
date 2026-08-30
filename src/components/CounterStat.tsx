import { useEffect, useRef, useState } from "react";

interface CounterStatProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  label: string;
  sublabel?: string;
  liveIncrement?: boolean;
}

export default function CounterStat({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  label,
  sublabel,
  liveIncrement = false,
}: CounterStatProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const startVal = 0;
          const endVal = value;

          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (endVal - startVal) * easeOutProgress;
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(endVal);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  // Optional live increment simulation
  useEffect(() => {
    if (!liveIncrement || !hasAnimated) return;

    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3 + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [liveIncrement, hasAnimated]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <div ref={ref} className="flex flex-col">
      <div className="flex items-baseline gap-1 text-3xl sm:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-foreground">
        {prefix && <span className="text-primary font-sans">{prefix}</span>}
        <span className="text-glow-cyan text-foreground">{formatted}</span>
        {suffix && <span className="text-primary font-sans text-2xl sm:text-3xl font-semibold">{suffix}</span>}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground/90">{label}</div>
      {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-lg border border-border bg-muted/40 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center h-9 px-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/60 text-foreground transition-all duration-300 shadow-sm hover:border-primary/50 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        showLabel ? "gap-2 px-3" : "w-9"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative h-4 w-4 flex items-center justify-center">
        {/* Sun Icon for Dark Mode (click to go light) */}
        <Sun
          className={`h-4 w-4 text-amber-400 transition-all duration-300 transform absolute ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        {/* Moon Icon for Light Mode (click to go dark) */}
        <Moon
          className={`h-4 w-4 text-primary transition-all duration-300 transform absolute ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-medium tracking-wide">
          {isDark ? "DARK" : "LIGHT"}
        </span>
      )}
    </button>
  );
}

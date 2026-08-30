import { Link } from "react-router-dom";
import {
  Shield, Bitcoin, Eye, Search, LogOut, User,
  Lock, HardDrive, Usb, ChevronRight, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ScrollReveal from "@/components/ScrollReveal";

const webTools = [
  { icon: Bitcoin, name: "CryptoTrace AI",          route: "/tools/crypto-trace",   tag: "BLOCKCHAIN INTEL" },
  { icon: Eye,     name: "Malware Detector",         route: "/tools/malware-scanner", tag: "BROWSER SANDBOX" },
  { icon: Search,  name: "Vulnerability Scanner",    route: "/tools/vuln-scanner",   tag: "CVE + EPSS" },
  { icon: Shield,  name: "FraudEye Scanner",         route: "/tools/fraud-scanner",  tag: "ANTI-FRAUD AI" },
];

const desktopTools = [
  { icon: Lock,      name: "Password Manager",      tag: "ENCRYPTED VAULT" },
  { icon: HardDrive, name: "File System Crawler",   tag: "LOCAL AUDITOR" },
  { icon: Usb,       name: "USB Monitor",           tag: "HARDWARE SENTRY" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatar      = user?.photoURL;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">SafeByte</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="flex items-center gap-2.5">
              {avatar ? (
                <img src={avatar} alt={displayName} className="h-8 w-8 rounded-full border border-border" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-12">

        {/* ── Welcome ───────────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-card/60 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              {avatar ? (
                <img src={avatar} alt={displayName} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Dashboard</p>
              <h1 className="text-2xl font-bold">Welcome, {displayName}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </span>
                <span className={`flex items-center gap-1.5 ${user?.emailVerified ? "text-emerald-400" : "text-yellow-400"}`}>
                  <Shield className="h-3.5 w-3.5" />
                  {user?.emailVerified ? "Email Verified" : "Email Not Verified"}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Web Tools ─────────────────────────────────────────────────────── */}
        <ScrollReveal delay={80}>
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-widest uppercase mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Browser-Based Security Tools
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {webTools.map((t) => (
                <Link
                  key={t.name}
                  to={t.route}
                  className="group p-5 rounded-xl border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="text-[10px] font-mono text-primary/70 mt-1">{t.tag}</p>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Desktop Tools ─────────────────────────────────────────────────── */}
        <ScrollReveal delay={120}>
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-mono tracking-widest uppercase mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Desktop Auditing Applications
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {desktopTools.map((t) => (
                <Link
                  key={t.name}
                  to="/tools"
                  className="group p-5 rounded-xl border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="text-[10px] font-mono text-primary/70 mt-1">{t.tag}</p>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Quick links ───────────────────────────────────────────────────── */}
        <ScrollReveal delay={160}>
          <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            {[
              { label: "View Services",  to: "/services" },
              { label: "About SafeByte", to: "/about"    },
              { label: "Contact Us",     to: "/contact"  },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-center py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

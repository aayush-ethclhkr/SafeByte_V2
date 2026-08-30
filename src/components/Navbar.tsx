import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, ArrowRight, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { to: "/", label: "Overview" },
  { to: "/services", label: "Capabilities" },
  { to: "/tools", label: "Security Tools" },
  { to: "/about", label: "About & Team" },
  { to: "/contact", label: "Contact & Scoping" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all">
      <div className="container flex h-16 sm:h-18 items-center justify-between">
        {/* Logo & Status */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 border border-primary/30 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all">
              <Shield className="h-5 w-5 text-primary transition-transform group-hover:scale-105" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
                Safe<span className="text-primary text-glow-cyan">Byte</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/80 tracking-widest leading-none mt-1">
                CYBER DEFENSE
              </span>
            </div>
          </Link>

          {/* SOC Operational status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-500 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>SOC ACTIVE</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Action Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border" asChild>
                <Link to="/dashboard">
                  <User className="h-3.5 w-3.5" />
                  {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground" onClick={logout}>
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="text-xs border-border" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-[0_0_20px_hsl(var(--primary)/0.25)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all gap-1.5 text-xs"
                asChild
              >
                <Link to="/contact">
                  Request Consultation <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls: Theme toggle + Menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="text-foreground p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-2xl animate-fade-in shadow-2xl">
          <div className="container py-5 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-border/60 text-xs font-mono">
              <span className="text-muted-foreground">SYSTEM STATUS</span>
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> 24/7 MONITORING
              </span>
            </div>

            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                    isActive
                      ? "text-primary bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-border/60 space-y-2">
              {user ? (
                <>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <User className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                  </Button>
                  <Button className="w-full" variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      Book Security Assessment
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

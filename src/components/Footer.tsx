import { Shield, PhoneCall, Mail, MapPin, Key, ExternalLink, Radio } from "lucide-react";
import { Link } from "react-router-dom";

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const Footer = () => (
  <footer className="border-t border-border bg-card/60 relative text-foreground/90 font-sans">
    {/* Incident Triage Strip */}
    <div className="border-b border-border/80 bg-muted/40">
      <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono font-semibold text-foreground tracking-wide">
            24/7 ACTIVE INCIDENT &amp; BREACH RESPONSE DESK
          </span>
        </div>
        <div className="flex items-center gap-6 font-mono text-muted-foreground">
          <a
            href="tel:+918923817932"
            className="flex items-center gap-1.5 text-primary hover:underline font-bold"
          >
            <PhoneCall className="h-3.5 w-3.5" /> +91 89238 17932
          </a>
          <span className="hidden md:inline text-muted-foreground/30">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
            <Radio className="h-3.5 w-3.5" /> MTTR &lt; 15 MIN
          </span>
        </div>
      </div>
    </div>

    {/* Main Footer Content */}
    <div className="container py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
        {/* Brand column */}
        <div className="lg:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/30">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Safe<span className="text-primary text-glow-cyan">Byte</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            SafeByte is an offensive cybersecurity consultancy delivering adversary simulation, penetration testing, smart contract auditing, and rapid incident response to high-stakes organizations worldwide.
          </p>
          <div className="pt-2 text-[11px] font-mono text-muted-foreground/80 space-y-1">
            <div>METHODOLOGIES: NIST SP 800-115 · MITRE ATT&amp;CK · OWASP</div>
            <div>VERIFIED CREDENTIALS: OSCP · CEH · CRTP · CISSP</div>
          </div>
        </div>

        {/* Capabilities column */}
        <div className="lg:col-span-3 space-y-3 text-xs">
          <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            Security Capabilities
          </h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Penetration Testing (Web, API, Mobile)
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                AI Red Teaming &amp; Adversary Emulation
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Digital Forensics &amp; Incident Response (DFIR)
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                Cloud &amp; Infrastructure Hardening
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary transition-colors">
                CryptoTrace Blockchain Intelligence
              </Link>
            </li>
          </ul>
        </div>

        {/* Tools & Company column */}
        <div className="lg:col-span-2 space-y-3 text-xs">
          <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            Platform &amp; Suite
          </h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/tools" className="hover:text-primary transition-colors">
                Security Tools Suite
              </Link>
            </li>
            <li>
              <Link to="/tools/malware-scanner" className="hover:text-primary transition-colors">
                Malware Detector
              </Link>
            </li>
            <li>
              <Link to="/tools/vuln-scanner" className="hover:text-primary transition-colors">
                Vulnerability Scanner
              </Link>
            </li>
            <li>
              <Link to="/tools/crypto-trace" className="hover:text-primary transition-colors">
                CryptoTrace AI
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary transition-colors">
                Engineering Team
              </Link>
            </li>
          </ul>
        </div>

        {/* Direct Contact column */}
        <div className="lg:col-span-3 space-y-3 text-xs">
          <h4 className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            Direct Operations
          </h4>
          <ul className="space-y-2 text-muted-foreground font-mono">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <a href="mailto:team.safebyte@gmail.com" className="hover:text-primary transition-colors">
                team.safebyte@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
              <a href="tel:+918923817932" className="hover:text-primary transition-colors">
                +91 89238 17932
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>Meerut, Uttar Pradesh, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-6 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} SafeByte Security. All rights reserved.</span>
          <span className="hidden sm:inline text-muted-foreground/30">&bull;</span>
          <span className="hidden sm:inline font-mono text-[11px] text-emerald-500 dark:text-emerald-400">
            ENCRYPTED COMMS ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/safebyte-x-vyadh-a43a90361/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            href="https://www.instagram.com/safebyte_team/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/contact" className="hover:text-primary transition-colors">
              Responsible Disclosure
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Privacy &amp; Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

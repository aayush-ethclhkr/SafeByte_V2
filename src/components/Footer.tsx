import { Shield } from "lucide-react";
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
  <footer className="border-t border-border/50 bg-card/50">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Safe<span className="text-primary">Byte</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enterprise-grade cybersecurity solutions protecting organizations worldwide since 2018.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-primary transition-colors">Penetration Testing</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Vulnerability Assessment</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Network Security</Link></li>
            <li><Link to="/services" className="hover:text-primary transition-colors">Cloud Security</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/tools" className="hover:text-primary transition-colors">Our Tools</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>team.safebyte@gmail.com</li>
            <li>+91 89238 17932</li>
            <li>Meerut, Uttar Pradesh, India</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2026 SafeByte. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="https://www.linkedin.com/in/safebyte-x-vyadh-a43a90361/" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a href="https://www.instagram.com/safebyte_team/" target="_blank" rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

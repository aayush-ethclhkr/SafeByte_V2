import { Link } from "react-router-dom";
import { Shield, Search, Server, Bot, Lock, Eye, ChevronRight, CheckCircle, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  { icon: Search, title: "Penetration Testing", desc: "Simulate real-world attacks to identify vulnerabilities before malicious actors do." },
  { icon: Bitcoin, title: "CryptoTrace AI", desc: "Trace any blockchain wallet — multi-chain balance lookup, transaction intelligence, risk scoring, and OFAC registry cross-check across 7 networks." },
  { icon: Server, title: "System Auditing Tools", desc: "Standalone desktop apps for USB monitoring, file system crawling, and credential vault management — available on macOS and Windows." },
  { icon: Bot, title: "AI Red Teamer", desc: "Autonomous AI-driven adversarial testing that simulates sophisticated attack chains, identifies logic flaws, and stress-tests your defenses continuously." },
];

const trustedBy = ["Meridian Corp", "Vaultline", "Arcsys", "Northgate Labs", "Hexacore"];

const Index = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 cyber-grid gradient-mesh" />
      <div className="container relative">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6 animate-fade-up"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            THREAT MONITORING ACTIVE
          </div>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-foreground mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Securing the{" "}
            <span className="text-primary text-glow">Digital Future</span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Advanced cybersecurity solutions that protect your business from evolving threats. Proactive defense, real-time monitoring, zero compromise.
          </p>
          <div
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button size="lg" asChild>
              <Link to="/contact">Get Protected</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/services">
                Request Audit <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Services */}
    <section className="py-24 md:py-32">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Comprehensive Security Solutions</h2>
          </div>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 100}>
              <div className="group p-6 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300">
                <s.icon className="h-8 w-8 text-primary mb-4 transition-transform group-hover:scale-110 duration-200" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Tools highlight */}
    <section className="py-24 md:py-32 border-y border-border/50 bg-card/20">
      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Proprietary Tech</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Security Tools Suite</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/tools">View All Tools <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Lock, name: "Password Manager", desc: "Military-grade encrypted vault for credential management" },
            { icon: Eye, name: "Malware Detector", desc: "AI-powered real-time threat detection and quarantine" },
            { icon: Bitcoin, name: "CryptoTrace AI", desc: "Multi-chain wallet tracing, risk scoring, and OFAC registry cross-check" },
          ].map((tool, i) => (
            <ScrollReveal key={tool.name} delay={i * 100}>
              <div className="p-5 rounded-lg border border-border/50 bg-background/50 hover:border-primary/20 transition-all duration-300">
                <tool.icon className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-semibold text-foreground mb-1 text-sm">{tool.name}</h4>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Trust */}
    <section className="py-16">
      <div className="container">
        <ScrollReveal>
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-8">Trusted by leading organizations</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustedBy.map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/50 tracking-wide">{name}</span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 md:py-32 border-t border-border/50">
      <div className="container text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Free Security Assessment Available</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Fortify Your Defenses?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Get a comprehensive security audit and actionable recommendations from our expert team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/contact">Get Protected</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </div>
);

export default Index;

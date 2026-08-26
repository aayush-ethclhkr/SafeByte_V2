import { Link } from "react-router-dom";
import { Search, Bug, BarChart3, Server, Cloud, Shield, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  {
    icon: Search,
    title: "Penetration Testing",
    desc: "Our OSCP-certified team simulates real-world attack scenarios across your web applications, APIs, mobile apps, and internal networks. We go beyond automated scanning — every test includes manual exploitation, privilege escalation attempts, and detailed proof-of-concept documentation.",
    features: ["Web & API Testing", "Internal Network Testing", "Mobile Application Testing", "Social Engineering Assessments"],
    status: "coming_soon" as const,
  },
  {
    icon: Bug,
    title: "Malware Analysis",
    desc: "Our reverse engineering lab analyzes suspicious binaries, scripts, and payloads to determine capabilities, origin, and impact. We provide actionable intelligence so your team can respond faster and prevent re-infection.",
    features: ["Static & Dynamic Analysis", "Behavioral Sandboxing", "Indicator of Compromise Extraction", "Threat Intelligence Reports"],
    status: "available" as const,
  },
  {
    icon: BarChart3,
    title: "Risk Assessment",
    desc: "Comprehensive evaluation of your security posture mapped to frameworks like NIST CSF, ISO 27001, and CIS Controls. We identify gaps, prioritize remediation, and build a roadmap aligned with your business objectives.",
    features: ["Framework Compliance Mapping", "Asset Discovery & Classification", "Threat Modeling", "Executive Risk Reports"],
    status: "available" as const,
  },
  {
    icon: Server,
    title: "Network Security",
    desc: "Design and deploy robust network defenses including firewall configuration, segmentation strategies, and intrusion detection systems. Continuous monitoring ensures threats are identified and contained in real time.",
    features: ["Firewall & IDS/IPS Configuration", "Network Segmentation", "Traffic Analysis", "24/7 SOC Monitoring"],
    status: "coming_soon" as const,
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    desc: "Secure your AWS, Azure, and GCP environments with configuration auditing, identity management reviews, and continuous compliance monitoring. We architect cloud-native security controls that scale with your infrastructure.",
    features: ["Cloud Configuration Audit", "IAM Review & Hardening", "Container Security", "Compliance Automation"],
    status: "coming_soon" as const,
  },
  {
    icon: Shield,
    title: "Incident Response",
    desc: "When a breach occurs, our rapid response team deploys within hours to contain the threat, preserve evidence, and restore operations. Post-incident, we conduct thorough forensic analysis and deliver recommendations to prevent recurrence.",
    features: ["24/7 Rapid Response", "Digital Forensics", "Evidence Preservation", "Post-Incident Review"],
    status: "coming_soon" as const,
  },
];

const Services = () => (
  <div className="min-h-screen pt-24">
    <section className="py-20 md:py-28">
      <div className="container max-w-3xl">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4 animate-fade-up">Services</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Security solutions engineered for real threats
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
          From proactive testing to emergency response, our services cover the full spectrum of cybersecurity. Each engagement is tailored to your environment, risk profile, and regulatory requirements.
        </p>
      </div>
    </section>

    <section className="pb-24 md:pb-32">
      <div className="container">
        <div className="space-y-8">
          {services.map((s, i) => {
            const isComingSoon = s.status === "coming_soon";
            return (
              <ScrollReveal key={s.title} delay={i * 80}>
                <div className={`relative p-8 rounded-lg border transition-all duration-300 ${
                  isComingSoon
                    ? "border-border/30 bg-card/20 opacity-75"
                    : "border-border/50 bg-card/50 hover:border-primary/20"
                }`}>

                  {/* Coming Soon ribbon */}
                  {isComingSoon && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold">
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        isComingSoon ? "bg-muted/30" : "bg-primary/10"
                      }`}>
                        <s.icon className={`h-6 w-6 ${isComingSoon ? "text-muted-foreground" : "text-primary"}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-xl font-semibold ${isComingSoon ? "text-foreground/60" : "text-foreground"}`}>
                          {s.title}
                        </h3>
                        {!isComingSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            AVAILABLE
                          </span>
                        )}
                      </div>
                      <p className={`leading-relaxed mb-4 ${isComingSoon ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                        {s.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.features.map((f) => (
                          <span key={f} className={`px-2.5 py-1 rounded-md text-xs ${
                            isComingSoon
                              ? "bg-muted/20 text-muted-foreground/40 border border-border/20"
                              : "bg-muted/50 text-muted-foreground"
                          }`}>
                            {f}
                          </span>
                        ))}
                      </div>
                      {isComingSoon && (
                        <p className="mt-4 text-xs text-yellow-400/80 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          This service is currently in development. Join the waitlist to be notified when it launches.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Need a custom engagement? Let's design a solution for your specific requirements.</p>
            <Button size="lg" asChild>
              <Link to="/contact">Request Consultation <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </div>
);

export default Services;

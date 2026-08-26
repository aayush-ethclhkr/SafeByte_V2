import { Shield, Target, Eye, Users } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const values = [
  { icon: Shield, title: "Integrity", desc: "We operate with transparency and uphold the highest ethical standards in every engagement." },
  { icon: Target, title: "Precision", desc: "Our methodologies are refined through thousands of real-world assessments across industries." },
  { icon: Eye, title: "Vigilance", desc: "Threats don't sleep, neither do we. Continuous monitoring is embedded in everything we build." },
  { icon: Users, title: "Partnership", desc: "We don't just deliver reports — we embed with your team to build lasting security culture." },
];

const About = () => (
  <div className="min-h-screen pt-24">

    {/* Hero */}
    <section className="py-20 md:py-28">
      <div className="container max-w-3xl">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4 animate-fade-up">About SafeByte</p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          Defending what matters in a connected world
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
          Founded in 2018, SafeByte has grown from a specialized penetration testing firm into a full-spectrum cybersecurity partner for enterprises, governments, and high-growth startups. Our team of 80+ security engineers, researchers, and analysts operates from six global offices.
        </p>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 md:py-28 border-y border-border/50 bg-card/30">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12">
          <ScrollReveal>
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">Make enterprise security accessible and effective</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe every organization, regardless of size, deserves access to world-class security expertise. Our mission is to democratize advanced threat detection and response capabilities through innovative tools and dedicated partnerships.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Our Vision</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">A world where digital trust is the default</h2>
              <p className="text-muted-foreground leading-relaxed">
                We envision a future where cybersecurity is proactive rather than reactive — where organizations can innovate confidently knowing their digital infrastructure is resilient against evolving threats.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Core Values</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">What drives us</h2>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 100}>
              <div className="p-6 rounded-lg border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300">
                <v.icon className="h-7 w-7 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

  </div>
);

export default About;

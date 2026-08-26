import { useState, useRef } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID           = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID          = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_AUTOREPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY           = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

const Contact = () => {
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setSending(true);
    try {
      const formData = new FormData(formRef.current);
      const templateParams = {
        from_name:    formData.get("from_name"),
        from_email:   formData.get("from_email"),
        organization: formData.get("organization"),
        message:      formData.get("message"),
      };

      // Send notification to SafeByte team
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );

      // Send auto-reply to the user
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTOREPLY_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent! We'll be in touch within 24 hours.");
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-4 animate-fade-up">Contact</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
              Let's secure your organization
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
              Reach out for a free initial consultation. Our team responds within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <ScrollReveal>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                      <Input name="from_name" placeholder="Your name" required className="bg-card/50 border-border/50 focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                      <Input name="from_email" type="email" placeholder="you@company.com" required className="bg-card/50 border-border/50 focus:border-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Organization</label>
                    <Input name="organization" placeholder="Company name" className="bg-card/50 border-border/50 focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                    <Textarea
                      name="message"
                      placeholder="Tell us about your security needs..."
                      required
                      rows={5}
                      className="bg-card/50 border-border/50 focus:border-primary/50 resize-none"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={sending} className="gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-2">
              <ScrollReveal delay={150}>
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: "Email", value: "team.safebyte@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+91 89238 17932" },
                    { icon: MapPin, label: "Office", value: "Meerut, Uttar Pradesh\nIndia" },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ))}

                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

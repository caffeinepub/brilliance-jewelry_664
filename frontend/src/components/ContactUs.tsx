import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@lobodajewelry.com",
    desc: "We respond within 24 hours",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (800) LOBODA-1",
    desc: "Mon–Fri, 9am–6pm EST",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "United States",
    desc: "Serving customers nationwide",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Fri: 9am–6pm",
    desc: "Weekend: By appointment",
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    toast.success("Message sent! We'll be in touch soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <section className="bg-charcoal py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">Get in Touch</p>
          <h1 className="font-serif text-5xl lg:text-6xl text-ivory font-light mb-6">
            Contact Us
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="font-sans text-sm text-ivory/70 leading-relaxed">
            We'd love to hear from you. Reach out with any questions about our collections or services.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">Reach Us</p>
            <h2 className="font-serif text-3xl text-charcoal mb-6">We're Here to Help</h2>
            <div className="h-px w-16 bg-gradient-to-r from-gold to-transparent mb-8" />
            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-10">
              Whether you have questions about our upcoming collection, need assistance with a custom order, or simply want to learn more about LOBODA Jewelry — our team is ready to assist you.
            </p>

            <div className="space-y-6">
              {CONTACT_INFO.map(({ icon: Icon, label, value, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-ivory-dark flex items-center justify-center">
                    <Icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p className="font-serif text-lg text-charcoal">{value}</p>
                    <p className="font-sans text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 shadow-luxury">
            <h3 className="font-serif text-2xl text-charcoal mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-border px-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-border px-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory"
                  placeholder="Inquiry about engagement rings"
                />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-border px-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:border-gold transition-colors bg-ivory resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-charcoal py-4 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

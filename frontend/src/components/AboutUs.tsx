import { useNavigate } from "@tanstack/react-router";
import { Shield, Award, Heart, Gem } from "lucide-react";

const VALUES = [
  {
    icon: Gem,
    title: "Exceptional Quality",
    description: "Every piece in our collection is carefully curated to meet the highest standards of craftsmanship and beauty.",
  },
  {
    icon: Shield,
    title: "Fully Compliant",
    description: "We operate under strict regulatory compliance, ensuring every transaction is secure and transparent.",
  },
  {
    icon: Heart,
    title: "Crafted with Passion",
    description: "Our jewelry is selected with love and dedication, honoring the artisans who pour their hearts into each creation.",
  },
  {
    icon: Award,
    title: "Trusted Excellence",
    description: "We partner only with reputable vendors who share our commitment to ethical sourcing and premium quality.",
  },
];

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <section className="bg-charcoal py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">Our Story</p>
          <h1 className="font-serif text-5xl lg:text-6xl text-ivory font-light mb-6">
            About LOBODA Jewelry
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="font-sans text-sm text-ivory/70 leading-relaxed">
            Where timeless elegance meets modern sophistication.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">Who We Are</p>
            <h2 className="font-serif text-4xl text-charcoal mb-6">
              A Legacy of Beauty & Trust
            </h2>
            <div className="h-px w-16 bg-gradient-to-r from-gold to-transparent mb-8" />
            <div className="space-y-5 font-sans text-sm text-muted-foreground leading-relaxed">
              <p>
                LOBODA Jewelry was born from a deep appreciation for the art of fine jewelry — pieces that transcend trends and become cherished heirlooms passed down through generations.
              </p>
              <p>
                We operate as a curated dropshipping platform, partnering with the world's finest jewelry artisans and vendors. This model allows us to offer an extraordinary breadth of styles and price points while maintaining the highest standards of quality and compliance.
              </p>
              <p>
                Every piece you discover on LOBODA Jewelry has been vetted for authenticity, craftsmanship, and ethical sourcing. We take every precaution to ensure your shopping experience is not only beautiful but also safe and transparent.
              </p>
              <p>
                Our store is currently in its final preparation stages. We are curating collections across engagement rings, wedding jewelry, fine gemstones, and everyday luxury pieces — all ready to be unveiled at our grand opening.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-charcoal p-1">
              <img
                src="/assets/generated/hero-banner.dim_1600x700.png"
                alt="LOBODA Jewelry Story"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gold p-6 shadow-gold">
              <p className="font-serif text-3xl text-charcoal font-bold">2024</p>
              <p className="font-sans text-xs text-charcoal/80 tracking-wider uppercase">Est.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-3">Our Principles</p>
            <h2 className="font-serif text-4xl text-charcoal mb-4">What We Stand For</h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-ivory-dark mb-5 group-hover:bg-gold/10 transition-colors">
                  <Icon size={28} className="text-gold" />
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3">{title}</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-4xl text-ivory mb-4">Ready to Explore?</h2>
          <p className="font-sans text-sm text-ivory/70 mb-8">
            Our collection is coming soon. Be the first to discover LOBODA Jewelry.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate({ to: "/" })}
              className="bg-gold text-charcoal px-8 py-3.5 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors"
            >
              View Collections
            </button>
            <button
              onClick={() => navigate({ to: "/contact" })}
              className="border border-ivory/40 text-ivory px-8 py-3.5 text-xs font-sans font-medium tracking-widest uppercase hover:border-gold hover:text-gold transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SiInstagram, SiFacebook, SiPinterest } from "react-icons/si";

const FOOTER_LINKS = {
  "Engagement": [
    { label: "Engagement Rings", category: "Engagement Rings" },
    { label: "Wedding Bands", category: "Wedding Bands" },
    { label: "Bridal Sets", category: "Bridal Sets" },
  ],
  "Jewelry": [
    { label: "Necklaces", category: "Necklaces" },
    { label: "Earrings", category: "Earrings" },
    { label: "Bracelets", category: "Bracelets" },
    { label: "Rings", category: "Rings" },
    { label: "Pendants", category: "Pendants" },
  ],
  "Gemstones": [
    { label: "Diamonds", category: "Diamonds" },
    { label: "Sapphires", category: "Sapphires" },
    { label: "Rubies", category: "Rubies" },
    { label: "Emeralds", category: "Emeralds" },
  ],
  "Company": [
    { label: "Our Story", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
  ],
};

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || "loboda-jewelry");

  const handleLink = (item: { label: string; category?: string; href?: string }) => {
    if (item.category) {
      navigate({ to: "/category/$categoryName", params: { categoryName: item.category } });
    } else if (item.href) {
      navigate({ to: item.href });
    }
  };

  return (
    <footer className="bg-charcoal text-ivory">
      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <button onClick={() => navigate({ to: "/" })} className="block mb-5">
              {/* Full vertical logo — renders naturally on charcoal background */}
              <img
                src="/assets/generated/loboda-logo.dim_600x700.png"
                alt="LOBODA Jewelry"
                className="h-24 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <div style={{ display: "none" }}>
                <span className="font-serif text-xl font-bold text-gold tracking-wider">LOBODA</span>
                <p className="font-sans text-xs tracking-widest text-ivory/60 uppercase">Jewelry</p>
              </div>
            </button>
            <p className="text-sm text-ivory/60 font-sans leading-relaxed mb-6">
              Exquisite jewelry crafted with passion. Compliant, secure, and dedicated to your most precious moments.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-ivory/50 hover:text-gold transition-colors">
                <SiInstagram size={18} />
              </a>
              <a href="#" className="text-ivory/50 hover:text-gold transition-colors">
                <SiFacebook size={18} />
              </a>
              <a href="#" className="text-ivory/50 hover:text-gold transition-colors">
                <SiPinterest size={18} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-serif text-sm font-semibold tracking-widest uppercase text-gold mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLink(link)}
                      className="text-sm text-ivory/60 hover:text-gold transition-colors font-sans tracking-wide"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-charcoal-mid">
          <div className="max-w-md">
            <h4 className="font-serif text-lg text-ivory mb-2">Stay in the Know</h4>
            <p className="text-sm text-ivory/60 font-sans mb-4">
              Be the first to know about new collections and exclusive offers.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-charcoal-mid border border-charcoal-mid/80 text-ivory placeholder-ivory/30 px-4 py-3 text-sm font-sans focus:outline-none focus:border-gold transition-colors"
              />
              <button className="bg-gold text-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal-mid">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ivory/40 font-sans">
            © {year} LOBODA Jewelry. All rights reserved.
          </p>
          <p className="text-xs text-ivory/40 font-sans flex items-center gap-1">
            Built with{" "}
            <Heart size={11} className="text-gold fill-gold" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

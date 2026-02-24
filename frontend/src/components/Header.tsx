import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Search, ShoppingBag, User } from "lucide-react";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";

interface NavSubItem {
  label: string;
  category?: string;
  href?: string;
}

interface NavItem {
  label: string;
  subItems: NavSubItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Engagement",
    subItems: [
      { label: "Engagement Rings", category: "Engagement Rings" },
      { label: "Wedding Bands", category: "Wedding Bands" },
      { label: "Bridal Sets", category: "Bridal Sets" },
    ],
  },
  {
    label: "Wedding",
    subItems: [
      { label: "Bridal Sets", category: "Bridal Sets" },
      { label: "Wedding Bands for Her", category: "Wedding Bands" },
      { label: "Wedding Bands for Him", category: "Wedding Bands" },
    ],
  },
  {
    label: "Jewelry",
    subItems: [
      { label: "Necklaces", category: "Necklaces" },
      { label: "Earrings", category: "Earrings" },
      { label: "Bracelets", category: "Bracelets" },
      { label: "Rings", category: "Rings" },
      { label: "Pendants", category: "Pendants" },
    ],
  },
  {
    label: "Gemstones",
    subItems: [
      { label: "Diamonds", category: "Diamonds" },
      { label: "Sapphires", category: "Sapphires" },
      { label: "Rubies", category: "Rubies" },
      { label: "Emeralds", category: "Emeralds" },
      { label: "Other Gemstones", category: "Other Gemstones" },
    ],
  },
  {
    label: "Gifts",
    subItems: [
      { label: "Gifts by Occasion", href: "/" },
      { label: "Gifts by Price", href: "/" },
      { label: "Personalized Gifts", category: "Personalized Gifts" },
    ],
  },
  {
    label: "About",
    subItems: [
      { label: "Our Story", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  const isLoggedIn = loginStatus === "success" && !!identity;

  const handleNavClick = (item: NavSubItem) => {
    setMobileOpen(false);
    setActiveDropdown(null);
    if (item.category) {
      navigate({ to: "/category/$categoryName", params: { categoryName: item.category } });
    } else if (item.href) {
      navigate({ to: item.href });
    }
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    };
  }, []);

  return (
    <header className="bg-charcoal text-ivory sticky top-0 z-50 shadow-luxury-lg">
      {/* Top bar */}
      <div className="bg-charcoal-mid border-b border-charcoal-mid/50">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <p className="text-xs tracking-wider text-gold/80 font-sans">
            Free shipping on orders over $500 · Compliant & Secure
          </p>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-ivory/70 font-sans">
                  {identity?.getPrincipal().toString().slice(0, 8)}...
                </span>
                {isAdmin && (
                  <button
                    onClick={() => navigate({ to: "/admin" })}
                    className="text-xs text-gold hover:text-gold-light tracking-wider font-sans transition-colors"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => clear()}
                  className="text-xs text-ivory/60 hover:text-ivory tracking-wider font-sans transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                disabled={loginStatus === "logging-in"}
                className="text-xs text-gold hover:text-gold-light tracking-wider font-sans transition-colors disabled:opacity-50"
              >
                {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo — full vertical on desktop, compact horizontal on mobile */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center flex-shrink-0"
          aria-label="LOBODA Jewelry — Home"
        >
          {/* Full vertical logo: visible on md+ screens */}
          <img
            src="/assets/generated/loboda-logo.dim_600x700.png"
            alt="LOBODA Jewelry"
            className="hidden md:block h-16 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Compact horizontal logo: visible on small screens */}
          <img
            src="/assets/generated/loboda-logo-icon.dim_300x120.png"
            alt="LOBODA Jewelry"
            className="block md:hidden h-10 w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              // Fallback text
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          {/* Text fallback (hidden by default) */}
          <div className="items-center gap-2" style={{ display: "none" }}>
            <span className="font-serif text-2xl font-bold text-gold tracking-wider">LOBODA</span>
            <span className="font-sans text-xs tracking-widest text-ivory/80 uppercase">Jewelry</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative nav-item"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-xs font-sans font-medium tracking-widest uppercase text-ivory/90 hover:text-gold transition-colors duration-200">
                {item.label}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {activeDropdown === item.label && (
                <div
                  className="absolute top-full left-0 bg-white shadow-luxury-lg border-t-2 border-gold min-w-[220px] z-50 animate-fade-in"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.label}
                      onClick={() => handleNavClick(sub)}
                      className="w-full text-left px-5 py-3 text-sm font-sans text-charcoal hover:bg-ivory hover:text-gold transition-colors duration-150 border-b border-ivory-dark last:border-0 tracking-wide"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-ivory/70 hover:text-gold transition-colors">
            <Search size={18} />
          </button>
          <button className="p-2 text-ivory/70 hover:text-gold transition-colors">
            <User size={18} />
          </button>
          <button className="p-2 text-ivory/70 hover:text-gold transition-colors">
            <ShoppingBag size={18} />
          </button>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-ivory/70 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-charcoal border-t border-charcoal-mid max-h-[80vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-charcoal-mid">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-xs font-sans font-medium tracking-widest uppercase text-ivory/90 hover:text-gold transition-colors"
                onClick={() =>
                  setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                }
              >
                {item.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === item.label && (
                <div className="bg-charcoal-mid pb-2">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.label}
                      onClick={() => handleNavClick(sub)}
                      className="w-full text-left px-8 py-3 text-sm font-sans text-ivory/70 hover:text-gold transition-colors tracking-wide"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Gem, ArrowRight, Star, Shield, Truck, Award } from "lucide-react";
import { useGetProducts, useGetProductsByCategory } from "@/hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_CARDS = [
  {
    name: "Engagement Rings",
    image: "/assets/generated/cat-engagement.dim_600x400.png",
    description: "Find your perfect symbol of love",
  },
  {
    name: "Wedding Bands",
    image: "/assets/generated/cat-wedding.dim_600x400.png",
    description: "Celebrate your eternal commitment",
  },
  {
    name: "Necklaces",
    image: "/assets/generated/cat-necklaces.dim_600x400.png",
    description: "Elevate every neckline",
  },
  {
    name: "Earrings",
    image: "/assets/generated/cat-earrings.dim_600x400.png",
    description: "From classic to contemporary",
  },
  {
    name: "Bracelets",
    image: "/assets/generated/cat-bracelets.dim_600x400.png",
    description: "Adorn your wrist in elegance",
  },
  {
    name: "Rings",
    image: "/assets/generated/cat-rings.dim_600x400.png",
    description: "Statement pieces for every occasion",
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "Fully Compliant", desc: "Regulated & Certified" },
  { icon: Truck, label: "Free Shipping", desc: "On orders over $500" },
  { icon: Award, label: "Premium Quality", desc: "Curated Collections" },
  { icon: Star, label: "Expert Curation", desc: "Handpicked Pieces" },
];

function ProductSkeleton() {
  return (
    <div className="bg-white border border-ivory-dark">
      <Skeleton className="w-full h-64" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

function ComingSoonGrid({ categoryName }: { categoryName?: string }) {
  return (
    <div className="py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ivory-dark mb-6">
        <Gem size={32} className="text-gold" />
      </div>
      <h3 className="font-serif text-3xl text-charcoal mb-3">
        {categoryName ? `${categoryName}` : "Our Collection"}
      </h3>
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-5" />
      <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto leading-relaxed mb-8">
        We are carefully curating an exquisite selection of{" "}
        {categoryName ? categoryName.toLowerCase() : "jewelry"} for you.
        Our store opens soon — sign up to be notified first.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 border border-border px-4 py-3 text-sm font-sans focus:outline-none focus:border-gold transition-colors bg-white"
        />
        <button className="bg-gold text-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors whitespace-nowrap">
          Notify Me
        </button>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { categoryName?: string };
  const categoryName = params?.categoryName;

  const allProductsQuery = useGetProducts(1, 12);
  const categoryProductsQuery = useGetProductsByCategory(categoryName || "", 1, 12);

  const activeQuery = categoryName ? categoryProductsQuery : allProductsQuery;
  const products = activeQuery.data?.items ?? [];
  const isLoading = activeQuery.isLoading;

  const handleCategoryClick = (name: string) => {
    navigate({ to: "/category/$categoryName", params: { categoryName: name } });
  };

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero Section */}
      {!categoryName && (
        <section className="relative overflow-hidden">
          <div className="relative h-[500px] lg:h-[620px]">
            <img
              src="/assets/generated/hero-banner.dim_1600x700.png"
              alt="LOBODA Jewelry Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <div className="max-w-xl">
                  <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">
                    New Collection · Coming Soon
                  </p>
                  <h1 className="font-serif text-5xl lg:text-6xl font-light text-ivory leading-tight mb-6">
                    Where Elegance
                    <br />
                    <em className="text-gold not-italic">Meets Artistry</em>
                  </h1>
                  <p className="font-sans text-sm text-ivory/80 leading-relaxed mb-8 max-w-sm">
                    Discover our curated collection of fine jewelry — crafted for life's most precious moments.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleCategoryClick("Engagement Rings")}
                      className="bg-gold text-charcoal px-8 py-3.5 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors"
                    >
                      Explore Collections
                    </button>
                    <button
                      onClick={() => navigate({ to: "/about" })}
                      className="border border-ivory/60 text-ivory px-8 py-3.5 text-xs font-sans font-medium tracking-widest uppercase hover:border-gold hover:text-gold transition-colors"
                    >
                      Our Story
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category breadcrumb if filtering */}
      {categoryName && (
        <div className="bg-white border-b border-ivory-dark">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm font-sans">
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-gold transition-colors"
            >
              Home
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-charcoal font-medium">{categoryName}</span>
          </div>
        </div>
      )}

      {/* Trust badges */}
      {!categoryName && (
        <section className="bg-charcoal py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-ivory tracking-wide">{label}</p>
                    <p className="font-sans text-xs text-ivory/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Cards Grid */}
      {!categoryName && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-3">Explore</p>
            <h2 className="font-serif text-4xl text-charcoal mb-4">Shop by Category</h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_CARDS.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative overflow-hidden bg-white shadow-luxury hover:shadow-luxury-lg transition-shadow duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                  {/* Coming Soon badge */}
                  <div className="absolute top-3 right-3 bg-gold text-charcoal text-xs font-sans font-semibold tracking-widest uppercase px-3 py-1">
                    Coming Soon
                  </div>
                </div>
                <div className="p-5 text-left">
                  <h3 className="font-serif text-xl text-charcoal mb-1 group-hover:text-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground mb-3">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-gold tracking-wider uppercase">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {categoryName && (
          <div className="mb-10">
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-2">Collection</p>
            <h2 className="font-serif text-4xl text-charcoal mb-3">{categoryName}</h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <ComingSoonGrid categoryName={categoryName} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id.toString()}
                className="group bg-white border border-ivory-dark hover:shadow-luxury transition-shadow duration-300"
              >
                <div className="relative h-64 overflow-hidden bg-ivory">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gem size={40} className="text-gold/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-sans text-xs text-gold tracking-wider uppercase mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-lg text-charcoal mb-2 group-hover:text-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xl text-charcoal">
                      ${(Number(product.price) / 100).toFixed(2)}
                    </span>
                    <button className="text-xs font-sans font-medium tracking-widest uppercase text-gold hover:text-gold-dark transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Opening Soon Banner */}
      {!categoryName && (
        <section className="bg-charcoal py-16 mt-8">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-4">
              Grand Opening
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl text-ivory mb-4">
              Our Store Opens Soon
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
            <p className="font-sans text-sm text-ivory/70 leading-relaxed mb-8 max-w-lg mx-auto">
              We are putting the finishing touches on our curated collection. Be among the first to experience LOBODA Jewelry — where every piece tells a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-charcoal-mid border border-charcoal-mid/80 text-ivory placeholder-ivory/30 px-4 py-3 text-sm font-sans focus:outline-none focus:border-gold transition-colors"
              />
              <button className="bg-gold text-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors whitespace-nowrap">
                Notify Me
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

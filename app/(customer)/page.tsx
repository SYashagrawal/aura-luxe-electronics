import Link from 'next/link';
import { ArrowRight, Shield, Award, Sparkles, Headphones, Laptop, Smartphone, Tv } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStoreBranding } from '@/lib/cms/config';
import ProductCard from '@/components/customer/ProductCard';
import { Product } from '@/lib/types/database';

export default async function HomePage() {
  const branding = await getStoreBranding();
  const supabase = createAdminClient();

  // Fetch featured products
  const { data: featuredData } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);

  // Fetch bestsellers
  const { data: bestsellerData } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_bestseller', true)
    .limit(4);

  const featuredProducts = (featuredData || []) as Product[];
  const bestsellerProducts = (bestsellerData || []) as Product[];

  return (
    <div className="space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-b from-charcoal via-noir to-noir px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5A46D_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10 py-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-champagne/30 bg-charcoal/80 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-champagne" />
            <span className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
              The 2026 Haute Électronique Collection
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-offwhite leading-[1.1]">
            Uncompromising <br className="hidden sm:inline" />
            <span className="text-champagne-gradient">Acoustic & Digital</span> Mastery
          </h1>

          <p className="text-sm sm:text-base text-neutralgrey max-w-2xl mx-auto leading-relaxed">
            Curated for discerning patrons. Handcrafted titanium mobile architectures, Danish acoustic sculptures, and master laser cinema systems.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-4 bg-champagne text-noir font-bold text-xs uppercase tracking-luxury rounded-xs hover:bg-champagne-light transition-all shadow-card flex items-center justify-center space-x-2"
            >
              <span>Explore Acquisitions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/account/support"
              className="w-full sm:w-auto px-8 py-4 bg-charcoal border border-white/10 text-offwhite font-semibold text-xs uppercase tracking-luxury rounded-xs hover:border-champagne transition-all flex items-center justify-center"
            >
              Private Salon Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Disciplines (Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
              Curated Disciplines
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-offwhite mt-1">
              Explore by Sensory Domain
            </h2>
          </div>
          <Link href="/products" className="text-xs uppercase tracking-luxury text-neutralgrey hover:text-champagne transition-colors mt-4 md:mt-0 flex items-center gap-1">
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/products?category=flagship-smartphones"
            className="group p-8 bg-charcoal border border-white/5 hover:border-champagne/40 rounded-xs transition-all duration-300 flex flex-col justify-between h-64"
          >
            <Smartphone className="w-8 h-8 text-champagne group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-base font-bold text-offwhite group-hover:text-champagne transition-colors">
                Flagship Smartphones
              </h3>
              <p className="text-xs text-neutralgrey mt-1">Grade 5 titanium & advanced neural silicon</p>
            </div>
          </Link>

          <Link
            href="/products?category=audiophile-acoustics"
            className="group p-8 bg-charcoal border border-white/5 hover:border-champagne/40 rounded-xs transition-all duration-300 flex flex-col justify-between h-64"
          >
            <Headphones className="w-8 h-8 text-champagne group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-base font-bold text-offwhite group-hover:text-champagne transition-colors">
                Audiophile Acoustics
              </h3>
              <p className="text-xs text-neutralgrey mt-1">Danish titanium drivers & moon-gold acoustic sculptures</p>
            </div>
          </Link>

          <Link
            href="/products?category=ultra-laptops"
            className="group p-8 bg-charcoal border border-white/5 hover:border-champagne/40 rounded-xs transition-all duration-300 flex flex-col justify-between h-64"
          >
            <Laptop className="w-8 h-8 text-champagne group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-base font-bold text-offwhite group-hover:text-champagne transition-colors">
                Ultra Laptops
              </h3>
              <p className="text-xs text-neutralgrey mt-1">Extreme memory bandwidth & bespoke workstations</p>
            </div>
          </Link>

          <Link
            href="/products?category=cinematic-visuals"
            className="group p-8 bg-charcoal border border-white/5 hover:border-champagne/40 rounded-xs transition-all duration-300 flex flex-col justify-between h-64"
          >
            <Tv className="w-8 h-8 text-champagne group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-base font-bold text-offwhite group-hover:text-champagne transition-colors">
                Cinematic Visuals
              </h3>
              <p className="text-xs text-neutralgrey mt-1">Studio master OLEDs & Leica triple RGB laser cinema</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Flagships */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
              Iconic Acquisitions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-offwhite mt-1">
              Engineering Masterpieces
            </h2>
          </div>
          <Link href="/products" className="text-xs uppercase tracking-luxury text-neutralgrey hover:text-champagne transition-colors mt-4 md:mt-0 flex items-center gap-1">
            <span>Discover Entire Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      {bestsellerProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/5 pb-6">
            <div>
              <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
                Patron Favorites
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-offwhite mt-1">
                The Most Coveted Pieces
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* The Aura Concierge Standard */}
      <section className="bg-charcoal border-y border-white/5 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
              White-Glove Protocol
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-offwhite">
              The {branding.store_name} Standard
            </h2>
            <p className="text-xs sm:text-sm text-neutralgrey">
              Every acquisition is accompanied by personalized stewardship, statutory tax transparency, and sealed serialized handoffs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-noir border border-white/5 rounded-xs space-y-4">
              <Shield className="w-6 h-6 text-champagne" />
              <h3 className="text-base font-bold text-offwhite">Direct Brand Provenance & Warranty</h3>
              <p className="text-xs text-neutralgrey leading-relaxed">
                100% factory sealed with verified serialized IMEI registration. Every piece includes original manufacturer warranty backed by complimentary 1-year concierge care.
              </p>
            </div>

            <div className="p-8 bg-noir border border-white/5 rounded-xs space-y-4">
              <Award className="w-6 h-6 text-champagne" />
              <h3 className="text-base font-bold text-offwhite">Statutory GST Transparency</h3>
              <p className="text-xs text-neutralgrey leading-relaxed">
                All prices are fully tax-inclusive with certified HSN codes, automated GSTR tax invoices, and full input tax credit eligibility for enterprise procurement.
              </p>
            </div>

            <div className="p-8 bg-noir border border-white/5 rounded-xs space-y-4">
              <Sparkles className="w-6 h-6 text-champagne" />
              <h3 className="text-base font-bold text-offwhite">Secured Transit & OTP Verification</h3>
              <p className="text-xs text-neutralgrey leading-relaxed">
                Dispatched via secured climate-controlled logistics with dedicated delivery agents and personal one-time passcode confirmation upon handoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
          Private Releases
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-offwhite">
          Receive Private Invitations to Limited Acquisitions
        </h2>
        <p className="text-xs text-neutralgrey">
          Subscribe to confidential announcements for limited edition audio sculptures, flagship phone launches, and bespoke salon previews.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 bg-charcoal border border-white/10 px-4 py-3 rounded-xs text-xs text-offwhite focus:outline-none focus:border-champagne placeholder:text-neutralgrey"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}

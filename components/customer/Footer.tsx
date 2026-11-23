import Link from 'next/link';
import { StoreBranding } from '@/lib/types/database';

interface FooterProps {
  branding: StoreBranding;
}

export default function Footer({ branding }: FooterProps) {
  return (
    <footer className="bg-charcoal border-t border-white/5 text-neutralgrey text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Address */}
          <div className="space-y-4">
            <div className="text-offwhite font-bold text-sm tracking-luxury uppercase">
              {branding.store_name}
            </div>
            <p className="text-[11px] leading-relaxed text-neutralgrey">
              {branding.tagline}
            </p>
            <div className="text-[11px] space-y-1 text-neutralgrey/80 pt-2">
              <p>{branding.contact.address}</p>
              <p>Concierge: {branding.contact.phone}</p>
              <p>Email: {branding.contact.email}</p>
            </div>
          </div>

          {/* Curated Disciplines */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-luxury uppercase text-offwhite">
              Curated Disciplines
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/products?category=flagship-smartphones" className="hover:text-champagne transition-colors">
                  Flagship Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=audiophile-acoustics" className="hover:text-champagne transition-colors">
                  Audiophile Acoustics
                </Link>
              </li>
              <li>
                <Link href="/products?category=ultra-laptops" className="hover:text-champagne transition-colors">
                  Ultra Laptops & Workstations
                </Link>
              </li>
              <li>
                <Link href="/products?category=cinematic-visuals" className="hover:text-champagne transition-colors">
                  Master Laser & OLED Cinema
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-luxury uppercase text-offwhite">
              Concierge & Orders
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/account/orders" className="hover:text-champagne transition-colors">
                  Order Tracking & Invoices
                </Link>
              </li>
              <li>
                <Link href="/account/support" className="hover:text-champagne transition-colors">
                  Private Support Concierge
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-champagne transition-colors">
                  White-Glove Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-champagne transition-colors">
                  Secured Transit & Handling
                </Link>
              </li>
            </ul>
          </div>

          {/* Enterprise & Portals */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-luxury uppercase text-offwhite">
              Business Governance
            </h4>
            <div className="space-y-2 text-[11px]">
              <p>GSTIN: <span className="font-mono text-offwhite">{branding.gstin}</span></p>
              <p>CIN: <span className="font-mono text-offwhite">{branding.cin}</span></p>
              <div className="pt-2 flex flex-col space-y-1.5">
                <Link href="/admin" className="text-champagne hover:underline">
                  Super Admin & Staff Terminal &rarr;
                </Link>
                <Link href="/delivery/login" className="text-champagne hover:underline">
                  Delivery Partner Fleet Terminal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutralgrey">
          <p>&copy; {new Date().getFullYear()} {branding.store_name}. All rights reserved under statutory trade regulations.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/policies/privacy" className="hover:text-offwhite transition-colors">Privacy Charter</Link>
            <Link href="/policies/terms" className="hover:text-offwhite transition-colors">Terms of Acquisition</Link>
            <Link href="/policies/returns" className="hover:text-offwhite transition-colors">Returns & Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Menu, X, ShieldCheck } from 'lucide-react';
import { StoreBranding } from '@/lib/types/database';

interface NavbarProps {
  branding: StoreBranding;
  cartCount?: number;
}

export default function Navbar({ branding, cartCount = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-noir/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-neutralgrey hover:text-offwhite transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Name - Dynamic from CMS */}
        <Link href="/" className="flex flex-col items-center sm:items-start group">
          <span className="font-extrabold text-lg sm:text-xl tracking-luxury uppercase text-offwhite group-hover:text-champagne transition-colors duration-300">
            {branding.store_name}
          </span>
          <span className="text-[9px] tracking-[0.25em] text-neutralgrey uppercase hidden sm:block">
            Haute Électronique
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-medium tracking-luxury uppercase text-neutralgrey">
          <Link href="/products" className="hover:text-offwhite hover:text-champagne transition-colors">
            Catalogue
          </Link>
          <Link href="/products?category=flagship-smartphones" className="hover:text-offwhite hover:text-champagne transition-colors">
            Smartphones
          </Link>
          <Link href="/products?category=audiophile-acoustics" className="hover:text-offwhite hover:text-champagne transition-colors">
            Acoustics
          </Link>
          <Link href="/products?category=ultra-laptops" className="hover:text-offwhite hover:text-champagne transition-colors">
            Computing
          </Link>
          <Link href="/products?category=cinematic-visuals" className="hover:text-offwhite hover:text-champagne transition-colors">
            Cinema
          </Link>
          <Link href="/account/support" className="hover:text-offwhite hover:text-champagne transition-colors text-champagne/90">
            Concierge
          </Link>
        </nav>

        {/* Right utility icons */}
        <div className="flex items-center space-x-5">
          <Link 
            href="/products?search=open" 
            className="p-2 text-neutralgrey hover:text-offwhite transition-colors"
            title="Search products"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link 
            href="/account/orders" 
            className="p-2 text-neutralgrey hover:text-offwhite transition-colors"
            title="Client Account"
          >
            <User className="w-4 h-4" />
          </Link>

          <Link 
            href="/cart" 
            className="p-2 text-neutralgrey hover:text-champagne transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-champagne text-noir font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin"
            className="hidden md:flex items-center space-x-1.5 py-1 px-2.5 rounded border border-white/10 hover:border-champagne/50 text-[10px] tracking-refined uppercase text-neutralgrey hover:text-champagne transition-all"
            title="Management Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
            <span>Portal</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-noir border-b border-white/10 px-6 py-6 space-y-4">
          <Link 
            href="/products" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-luxury text-offwhite hover:text-champagne"
          >
            Complete Catalogue
          </Link>
          <Link 
            href="/products?category=flagship-smartphones" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-luxury text-neutralgrey hover:text-offwhite"
          >
            Smartphones
          </Link>
          <Link 
            href="/products?category=audiophile-acoustics" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-luxury text-neutralgrey hover:text-offwhite"
          >
            Audiophile Acoustics
          </Link>
          <Link 
            href="/products?category=ultra-laptops" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-luxury text-neutralgrey hover:text-offwhite"
          >
            Ultra Computing
          </Link>
          <Link 
            href="/products?category=cinematic-visuals" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs uppercase tracking-luxury text-neutralgrey hover:text-offwhite"
          >
            Cinematic Visuals
          </Link>
          <div className="pt-4 border-t border-white/5 flex flex-col space-y-2">
            <Link 
              href="/account/orders" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-luxury text-champagne"
            >
              Client Account & Orders
            </Link>
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-luxury text-neutralgrey"
            >
              Staff & Super Admin Login
            </Link>
            <Link 
              href="/delivery/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-luxury text-neutralgrey"
            >
              Delivery Partner Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

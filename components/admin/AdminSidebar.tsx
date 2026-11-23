'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Barcode,
  Truck,
  Users,
  Receipt,
  RotateCcw,
  Palette,
  Settings,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { StoreBranding } from '@/lib/types/database';

interface AdminSidebarProps {
  branding: StoreBranding;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Executive Analytics', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products & Catalogue', icon: Package },
  { href: '/admin/orders', label: 'Order Fulfillment', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Multi-Warehouse Stock', icon: Boxes },
  { href: '/admin/inventory/serials', label: 'Serial & IMEI Tracking', icon: Barcode },
  { href: '/admin/delivery', label: 'Fleet & Serviceability', icon: Truck },
  { href: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { href: '/admin/finance/gst-reports', label: 'GST & Financials', icon: Receipt },
  { href: '/admin/staff', label: 'Staff & RBAC Matrix', icon: ShieldCheck },
  { href: '/admin/cms/branding', label: 'Website CMS & Customizer', icon: Palette },
  { href: '/admin/settings/general', label: 'System Configuration', icon: Settings },
];

export default function AdminSidebar({ branding }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-noir border-r border-white/5 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand & Portal Header */}
      <div>
        <div className="h-20 px-6 border-b border-white/5 flex flex-col justify-center">
          <span className="font-extrabold text-sm uppercase tracking-luxury text-offwhite truncate">
            {branding.store_name}
          </span>
          <span className="text-[10px] tracking-refined uppercase text-champagne font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Super Admin Terminal</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xs text-xs font-medium tracking-refined transition-colors ${
                  isActive
                    ? 'bg-charcoal text-champagne border border-champagne/20 font-semibold'
                    : 'text-neutralgrey hover:text-offwhite hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-champagne' : 'text-neutralgrey'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-[11px] text-neutralgrey hover:text-champagne bg-charcoal/50 rounded-xs transition-colors"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="text-[9px] text-neutralgrey/60 px-3">
          Build v1.0.0-prod | RLS Active
        </div>
      </div>
    </aside>
  );
}

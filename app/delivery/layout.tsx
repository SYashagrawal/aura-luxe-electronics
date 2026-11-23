import Link from 'next/link';
import { Truck, Navigation, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getStoreBranding } from '@/lib/cms/config';

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getStoreBranding();

  return (
    <div className="min-h-screen bg-noir text-offwhite flex flex-col font-sans">
      {/* Mobile-optimized Header */}
      <header className="h-16 bg-charcoal border-b border-white/5 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <Truck className="w-5 h-5 text-champagne" />
          <div>
            <span className="font-bold text-xs uppercase tracking-luxury text-offwhite block">
              {branding.store_name}
            </span>
            <span className="text-[9px] text-champagne uppercase tracking-refined font-semibold">
              Fleet Partner Mobile Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] bg-noir px-2 py-1 rounded-xs border border-white/10 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>GPS Active</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4">{children}</main>

      {/* Sticky Bottom Navigation */}
      <nav className="h-14 bg-charcoal border-t border-white/5 flex items-center justify-around text-xs sticky bottom-0 z-50">
        <Link href="/delivery" className="flex flex-col items-center space-y-1 text-champagne font-semibold">
          <Truck className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-refined">Active Runs</span>
        </Link>
        <Link href="/delivery/history" className="flex flex-col items-center space-y-1 text-neutralgrey hover:text-offwhite">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-refined">Delivered</span>
        </Link>
      </nav>
    </div>
  );
}

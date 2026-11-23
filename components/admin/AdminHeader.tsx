import { Bell, ShieldCheck, User } from 'lucide-react';

export default function AdminHeader() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-20 bg-noir border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <span className="text-xs text-neutralgrey">Management Session</span>
        <span className="text-xs text-neutralgrey/40">|</span>
        <span className="text-xs font-mono text-offwhite">{today}</span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Compliance indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/40 rounded-xs text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GSTIN & RLS Enforced</span>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center space-x-3 pl-4 border-l border-white/5">
          <div className="w-8 h-8 rounded-full bg-charcoal border border-champagne/40 flex items-center justify-center text-champagne text-xs font-bold">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-offwhite">Super Administrator</div>
            <div className="text-[10px] text-champagne">Full Authority Bypass</div>
          </div>
        </div>
      </div>
    </header>
  );
}

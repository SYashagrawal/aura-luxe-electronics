import { createAdminClient } from '@/lib/supabase/admin';
import { Settings, Shield, Key, Bell, MapPin, Truck } from 'lucide-react';

export default async function AdminGeneralSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-white/5">
        <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
          System & Cloud Integrations
        </div>
        <h1 className="text-2xl font-extrabold text-offwhite mt-1">
          Infrastructure Configuration
        </h1>
        <p className="text-xs text-neutralgrey mt-1">
          Manage cloud API keys, Indian payment gateway credentials, notifications, and logistics partners.
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Gateway */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold uppercase tracking-luxury text-champagne flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>Razorpay Payment Gateway Integration</span>
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
              Active / Production
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Razorpay Key ID</label>
              <input
                type="text"
                readOnly
                defaultValue={process.env.RAZORPAY_KEY_ID ? 'rzp_live_••••••••••••' : 'rzp_test_placeholder'}
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Webhook Secret Signature</label>
              <input
                type="password"
                readOnly
                defaultValue="••••••••••••••••••••"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono"
              />
            </div>
          </div>
          <div className="text-[11px] text-neutralgrey">
            Configured via server environment variables. HMAC-SHA256 signature verification active on all incoming webhooks.
          </div>
        </div>

        {/* Google Maps & Navigation */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold uppercase tracking-luxury text-champagne flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Google Maps & Directions API</span>
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
              Connected
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">Google Maps Browser API Key</label>
            <input
              type="text"
              readOnly
              defaultValue={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? 'AIzaSy••••••••••••••••' : 'Configured via NEXT_PUBLIC_GOOGLE_MAPS_KEY'}
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono"
            />
          </div>
          <div className="text-[11px] text-neutralgrey">
            Powers real-time driver navigation, customer delivery tracking, and accurate route calculation.
          </div>
        </div>

        {/* Logistics & Third-Party Couriers */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold uppercase tracking-luxury text-champagne flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Logistics & Courier Routing</span>
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-noir text-champagne border border-champagne/30">
              Hybrid Mode
            </span>
          </div>

          <div className="space-y-2 text-neutralgrey">
            <div className="flex items-center justify-between p-3 bg-noir rounded-xs border border-white/5">
              <div>
                <span className="font-bold text-offwhite block">In-House White-Glove Fleet</span>
                <span className="text-[10px]">Dedicated company personnel with OTP handoff & GPS tracking</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[10px] uppercase">Default Tier 1</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-noir rounded-xs border border-white/5">
              <div>
                <span className="font-bold text-offwhite block">Shiprocket / Delhivery Air Express</span>
                <span className="text-[10px]">Automated AWB generation for national tier 2 & remote pincodes</span>
              </div>
              <span className="text-champagne font-semibold text-[10px] uppercase">Active Relay</span>
            </div>
          </div>
        </div>

        {/* Notifications Gateway */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold uppercase tracking-luxury text-champagne flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Multi-Channel Notification Gateway</span>
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs bg-emerald-950 text-emerald-400 border border-emerald-800">
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-neutralgrey">
            <div className="p-3 bg-noir rounded-xs border border-white/5">
              <div className="font-bold text-offwhite">Email (Resend/SendGrid)</div>
              <div className="text-[10px] mt-1 text-emerald-400">Order & GST Invoices</div>
            </div>
            <div className="p-3 bg-noir rounded-xs border border-white/5">
              <div className="font-bold text-offwhite">SMS (MSG91 / Twilio)</div>
              <div className="text-[10px] mt-1 text-emerald-400">Dispatch & OTP Alerts</div>
            </div>
            <div className="p-3 bg-noir rounded-xs border border-white/5">
              <div className="font-bold text-offwhite">WhatsApp Business</div>
              <div className="text-[10px] mt-1 text-emerald-400">Live Status Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getStoreBranding } from '@/lib/cms/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { Palette, Save, CheckCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminBrandingPage() {
  const branding = await getStoreBranding();

  async function updateBrandingAction(formData: FormData) {
    'use server';

    const storeName = formData.get('store_name') as string;
    const tagline = formData.get('tagline') as string;
    const announcementText = formData.get('announcement_text') as string;
    const announcementEnabled = formData.get('announcement_enabled') === 'on';
    const gstin = formData.get('gstin') as string;
    const cin = formData.get('cin') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const newBranding = {
      ...branding,
      store_name: storeName,
      tagline,
      gstin,
      cin,
      contact: {
        ...branding.contact,
        email,
        phone,
        address,
      },
      announcement_bar: {
        ...branding.announcement_bar,
        enabled: announcementEnabled,
        text: announcementText,
      },
    };

    const client = createAdminClient();
    await client
      .from('website_settings')
      .upsert({
        key: 'store_branding',
        value: newBranding,
        updated_at: new Date().toISOString(),
      });

    redirect('/admin/cms/branding');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/5">
        <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
          No-Code CMS Customizer
        </div>
        <h1 className="text-2xl font-extrabold text-offwhite mt-1">
          Store Branding & Homepage Architecture
        </h1>
        <p className="text-xs text-neutralgrey mt-1">
          Configure business identity, dynamic store name, legal credentials, and announcement messaging across all customer touchpoints.
        </p>
      </div>

      <form action={updateBrandingAction} className="space-y-8 bg-charcoal border border-white/5 p-8 rounded-xs text-xs">
        {/* Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            1. Brand Identity & Nomenclature
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">
                Store Name (Dynamic Across App) *
              </label>
              <input
                type="text"
                name="store_name"
                defaultValue={branding.store_name}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-bold focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">
                Editorial Tagline *
              </label>
              <input
                type="text"
                name="tagline"
                defaultValue={branding.tagline}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            2. Customer Announcement Banner
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="announcement_enabled"
                name="announcement_enabled"
                defaultChecked={branding.announcement_bar.enabled}
                className="w-4 h-4 text-champagne rounded-xs"
              />
              <label htmlFor="announcement_enabled" className="text-xs text-offwhite font-medium cursor-pointer">
                Enable Announcement Bar across top of storefront
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                name="announcement_text"
                defaultValue={branding.announcement_bar.text}
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>
          </div>
        </div>

        {/* Statutory Governance & Registration */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            3. Statutory Business Registrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">
                Goods and Services Tax (GSTIN) *
              </label>
              <input
                type="text"
                name="gstin"
                defaultValue={branding.gstin}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">
                Corporate Identity Number (CIN) *
              </label>
              <input
                type="text"
                name="cin"
                defaultValue={branding.cin}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono focus:outline-none focus:border-champagne"
              />
            </div>
          </div>
        </div>

        {/* Official Contact & Headquarters */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            4. Official Concierge & Registered Office
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Concierge Email</label>
              <input
                type="email"
                name="email"
                defaultValue={branding.contact.email}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Concierge Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={branding.contact.phone}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Registered Address</label>
              <input
                type="text"
                name="address"
                defaultValue={branding.contact.address}
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-white/5">
          <button
            type="submit"
            className="px-8 py-3 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs flex items-center gap-2 shadow-card"
          >
            <Save className="w-4 h-4" />
            <span>Publish Branding Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

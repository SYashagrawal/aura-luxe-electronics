import { createAdminClient } from '../supabase/admin';
import { StoreBranding } from '../types/database';

export const DEFAULT_STORE_BRANDING: StoreBranding = {
  store_name: 'AURA LUXE ELECTRONICS',
  tagline: 'Precision Engineering Meets Timeless Sophistication',
  logo_url: '/images/logo.svg',
  favicon_url: '/favicon.ico',
  brand_colors: {
    charcoal: '#151515',
    noir: '#090909',
    offwhite: '#F7F7F5',
    champagne: '#C5A46D',
    neutralgrey: '#858585',
  },
  contact: {
    email: 'concierge@auraluxe.com',
    phone: '+91 98200 12345',
    whatsapp: '+91 98200 12345',
    address: 'Signature Tower, 18th Floor, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
  },
  social_links: {
    instagram: 'https://instagram.com/auraluxeelectronics',
    twitter: 'https://twitter.com/auraluxe',
    youtube: 'https://youtube.com/auraluxe',
  },
  gstin: '27AABCU9603R1ZM',
  cin: 'U72200MH2024PTC123456',
  announcement_bar: {
    enabled: true,
    text: 'COMPLIMENTARY WHITE-GLOVE EXPRESS DELIVERY ON ALL ORDERS ACROSS INDIA',
    link: '/policies/shipping',
  },
  features: {
    loyalty_enabled: true,
    reviews_enabled: true,
    qa_enabled: true,
    comparisons_enabled: true,
  },
};

/**
 * Loads dynamic store branding from database with graceful fallback
 */
export async function getStoreBranding(): Promise<StoreBranding> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'store_branding')
      .single();

    if (error || !data?.value) {
      return DEFAULT_STORE_BRANDING;
    }

    return {
      ...DEFAULT_STORE_BRANDING,
      ...(data.value as StoreBranding),
    };
  } catch {
    return DEFAULT_STORE_BRANDING;
  }
}

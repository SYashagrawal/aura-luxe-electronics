import type { Metadata } from 'next';
import './globals.css';
import { getStoreBranding } from '@/lib/cms/config';

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return {
    title: {
      default: `${branding.store_name} | Haute Électronique`,
      template: `%s | ${branding.store_name}`,
    },
    description: branding.tagline,
    icons: {
      icon: branding.favicon_url,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-noir text-offwhite min-h-screen antialiased selection:bg-champagne selection:text-noir font-sans">
        {children}
      </body>
    </html>
  );
}

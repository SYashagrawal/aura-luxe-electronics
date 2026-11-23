import { getStoreBranding } from '@/lib/cms/config';
import AnnouncementBar from '@/components/customer/AnnouncementBar';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getStoreBranding();

  return (
    <div className="flex flex-col min-h-screen bg-noir text-offwhite">
      <AnnouncementBar
        text={branding.announcement_bar.text}
        link={branding.announcement_bar.link}
        enabled={branding.announcement_bar.enabled}
      />
      <Navbar branding={branding} />
      <main className="flex-1">{children}</main>
      <Footer branding={branding} />
    </div>
  );
}

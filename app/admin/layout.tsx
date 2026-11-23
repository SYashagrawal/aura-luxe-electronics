import { getStoreBranding } from '@/lib/cms/config';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getStoreBranding();

  return (
    <div className="flex min-h-screen bg-charcoal-dark text-offwhite font-sans antialiased">
      <AdminSidebar branding={branding} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

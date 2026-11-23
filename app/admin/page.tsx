import { createAdminClient } from '@/lib/supabase/admin';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Package,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Parallel fetch analytics data
  const [
    { data: ordersData },
    { data: productsData },
    { data: lowStockData },
    { count: totalCustomersCount },
  ] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*'),
    supabase.from('inventory').select('*, products(name, sku), warehouses(name)').lt('quantity_on_hand', 10),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
  ]);

  const orders = ordersData || [];
  const products = productsData || [];
  const lowStockItems = lowStockData || [];

  // Metrics computation
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'placed').length;
  const confirmedOrders = orders.filter((o) => o.order_status === 'confirmed').length;
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Today's orders
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.created_at?.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Corporate Operations Dossier
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Executive Performance & Revenue Radar
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs transition-colors shadow-card"
          >
            + Register New Product
          </Link>
          <a
            href="/api/export/orders"
            className="px-4 py-2 bg-charcoal border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs transition-colors"
          >
            Export Sales Dossier (CSV)
          </a>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-3">
          <div className="flex items-center justify-between text-neutralgrey text-xs">
            <span className="uppercase tracking-refined font-semibold">Total Revenue (Gross)</span>
            <DollarSign className="w-4 h-4 text-champagne" />
          </div>
          <div className="text-2xl font-extrabold text-offwhite">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Today: ₹{todayRevenue.toLocaleString('en-IN')} ({todayOrders.length} orders)</span>
          </div>
        </div>

        {/* Card 2: Average Order Value */}
        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-3">
          <div className="flex items-center justify-between text-neutralgrey text-xs">
            <span className="uppercase tracking-refined font-semibold">Average Acquisition (AOV)</span>
            <TrendingUp className="w-4 h-4 text-champagne" />
          </div>
          <div className="text-2xl font-extrabold text-champagne">
            ₹{averageOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutralgrey">
            Calculated across {totalOrders} completed acquisitions
          </div>
        </div>

        {/* Card 3: Total Orders & Status */}
        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-3">
          <div className="flex items-center justify-between text-neutralgrey text-xs">
            <span className="uppercase tracking-refined font-semibold">Fulfillment Orders</span>
            <ShoppingCart className="w-4 h-4 text-champagne" />
          </div>
          <div className="text-2xl font-extrabold text-offwhite">
            {totalOrders}
          </div>
          <div className="text-[11px] text-neutralgrey space-x-2">
            <span className="text-emerald-400 font-semibold">{deliveredOrders} Delivered</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-semibold">{pendingOrders + confirmedOrders} Active</span>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-3">
          <div className="flex items-center justify-between text-neutralgrey text-xs">
            <span className="uppercase tracking-refined font-semibold">Catalogue & Inventory</span>
            <Boxes className="w-4 h-4 text-champagne" />
          </div>
          <div className="text-2xl font-extrabold text-offwhite">
            {products.length} Products
          </div>
          <div className="text-[11px] text-neutralgrey flex items-center gap-1.5">
            {lowStockItems.length > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockItems.length} Low-Stock Radar items
              </span>
            ) : (
              <span className="text-emerald-400">All warehouses adequately stocked</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders Fulfillment Stream */}
        <div className="lg:col-span-2 bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-luxury text-offwhite">
              Recent Order Fulfillment Stream
            </h3>
            <Link href="/admin/orders" className="text-xs text-champagne hover:underline">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs min-w-[500px]">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-offwhite hover:text-champagne">
                    {order.order_number}
                  </Link>
                  <div className="text-[11px] text-neutralgrey">
                    {order.customer_name} &bull; {order.shipping_address?.city}, {order.shipping_address?.state}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-offwhite">
                    ₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-neutralgrey uppercase">
                    {order.payment_method} &bull; {order.payment_status}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] uppercase tracking-refined px-2.5 py-0.5 rounded-xs font-semibold ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : order.order_status === 'cancelled'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-noir text-champagne border border-champagne/30'
                  }`}>
                    {order.order_status}
                  </span>

                  <a
                    href={`/api/invoices/${order.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-champagne hover:underline"
                  >
                    Invoice
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Low Stock Alert Radar */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-luxury text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low-Stock Inventory Radar</span>
            </h3>
            <Link href="/admin/inventory" className="text-xs text-champagne hover:underline">
              Inventory &rarr;
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-neutralgrey py-4">No low stock warnings active.</p>
          ) : (
            <div className="divide-y divide-white/5 space-y-3">
              {lowStockItems.slice(0, 5).map((inv: any) => (
                <div key={inv.id} className="pt-3 first:pt-0 text-xs">
                  <div className="font-semibold text-offwhite">{inv.products?.name || 'Item'}</div>
                  <div className="text-[10px] text-neutralgrey mt-0.5 flex justify-between">
                    <span>Location: {inv.warehouses?.name}</span>
                    <span className="font-mono text-amber-400 font-bold">Qty: {inv.quantity_on_hand}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <Link
              href="/admin/inventory/purchases"
              className="w-full py-2.5 bg-noir border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs block text-center transition-colors"
            >
              Draft Purchase Order (PO)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

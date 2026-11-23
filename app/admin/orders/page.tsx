import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order, DeliveryPartner } from '@/lib/types/database';
import { Download, Eye, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface AdminOrdersPageProps {
  searchParams: {
    status?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const supabase = createAdminClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      partner:delivery_partners(*)
    `)
    .order('created_at', { ascending: false });

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('order_status', searchParams.status);
  }

  const [{ data: ordersData }, { data: partnersData }] = await Promise.all([
    query,
    supabase.from('delivery_partners').select('*').eq('is_active', true),
  ]);

  const orders = (ordersData || []) as Order[];
  const partners = (partnersData || []) as DeliveryPartner[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Order Fulfillment Operations
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Orders & Shipments ({orders.length})
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/export/orders"
            className="px-4 py-2 bg-charcoal border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-champagne" />
            <span>Export Orders (CSV)</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['all', 'placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((st) => (
          <Link
            key={st}
            href={`/admin/orders${st === 'all' ? '' : `?status=${st}`}`}
            className={`px-3 py-1.5 rounded-xs uppercase tracking-refined text-[11px] font-semibold transition-colors ${
              (st === 'all' && !searchParams.status) || searchParams.status === st
                ? 'bg-champagne text-noir'
                : 'bg-charcoal text-neutralgrey hover:text-offwhite border border-white/5'
            }`}
          >
            {st}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-charcoal border border-white/5 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Client / Destination</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Total GST</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Fleet Partner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-offwhite">{order.order_number}</div>
                    <div className="text-[10px] text-neutralgrey">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-offwhite">{order.customer_name}</div>
                    <div className="text-[10px] text-neutralgrey">
                      {order.shipping_address?.city}, {order.shipping_address?.state} ({order.shipping_address?.pincode})
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-neutralgrey">
                    ₹{order.taxable_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-neutralgrey">
                    ₹{order.total_gst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <div className="text-[9px] text-neutralgrey/60">
                      {order.is_interstate ? 'IGST' : 'CGST+SGST'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-champagne font-mono">
                    ₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-xs font-semibold text-[10px] uppercase ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}>
                      {order.payment_status}
                    </span>
                    <div className="text-[9px] text-neutralgrey/80 uppercase mt-0.5">{order.payment_method}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-xs font-semibold text-[10px] uppercase tracking-refined ${
                      order.order_status === 'delivered'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : order.order_status === 'cancelled'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-noir text-champagne border border-champagne/30'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center text-neutralgrey">
                    {order.courier_name || 'Unassigned'}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <a
                      href={`/api/invoices/${order.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-champagne hover:underline inline-flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Invoice</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

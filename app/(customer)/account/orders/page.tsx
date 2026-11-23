import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order } from '@/lib/types/database';
import { Package, Clock, Eye, Download, AlertCircle } from 'lucide-react';

export default async function CustomerOrdersPage() {
  const supabase = createAdminClient();

  // Load latest orders
  const { data: ordersData } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const orders = (ordersData || []) as Order[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2.5 py-0.5 rounded-xs font-semibold uppercase tracking-refined">Delivered</span>;
      case 'out_for_delivery':
      case 'in_transit':
      case 'dispatched':
        return <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] px-2.5 py-0.5 rounded-xs font-semibold uppercase tracking-refined">In Transit</span>;
      case 'cancelled':
        return <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] px-2.5 py-0.5 rounded-xs font-semibold uppercase tracking-refined">Cancelled</span>;
      default:
        return <span className="bg-charcoal text-champagne border border-champagne/30 text-[10px] px-2.5 py-0.5 rounded-xs font-semibold uppercase tracking-refined">Processing</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Client Portal
          </div>
          <h1 className="text-3xl font-extrabold text-offwhite mt-1">
            Acquisition History & Tracking
          </h1>
        </div>
        <div className="text-xs text-neutralgrey">
          Track active shipments, download GST tax invoices, and manage returns.
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-charcoal border border-white/5 rounded-xs space-y-4">
          <Package className="w-8 h-8 text-neutralgrey mx-auto" />
          <h3 className="text-base font-semibold text-offwhite">No Acquisitions Recorded</h3>
          <p className="text-xs text-neutralgrey">You have not completed any acquisitions under this profile yet.</p>
          <Link
            href="/products"
            className="inline-block mt-2 px-6 py-2.5 bg-champagne text-noir font-bold text-xs uppercase tracking-luxury rounded-xs"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-charcoal border border-white/5 rounded-xs overflow-hidden divide-y divide-white/5"
            >
              {/* Order Header */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-charcoal/80">
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-neutralgrey block text-[10px] uppercase tracking-refined">Order Reference:</span>
                    <span className="font-mono font-bold text-offwhite">{order.order_number}</span>
                  </div>

                  <div>
                    <span className="text-neutralgrey block text-[10px] uppercase tracking-refined">Date Placed:</span>
                    <span className="text-offwhite">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutralgrey block text-[10px] uppercase tracking-refined">Amount:</span>
                    <span className="font-bold text-champagne">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutralgrey block text-[10px] uppercase tracking-refined">Status:</span>
                    <div className="mt-0.5">{getStatusBadge(order.order_status)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 bg-noir border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-champagne" />
                    <span>View Details</span>
                  </Link>

                  <a
                    href={`/api/invoices/${order.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-charcoal border border-champagne text-champagne hover:bg-champagne hover:text-noir text-xs font-bold uppercase tracking-refined rounded-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>GST Invoice</span>
                  </a>
                </div>
              </div>

              {/* Order Items Snapshot */}
              <div className="p-6 space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-offwhite">{item.product_name}</h4>
                      <div className="text-[11px] text-neutralgrey">
                        Qty: {item.quantity} | Unit Price: ₹{item.unit_price.toLocaleString('en-IN')} | GST: {item.gst_rate}%
                      </div>
                    </div>
                    <div className="font-mono font-bold text-offwhite">
                      ₹{item.total_price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order, OrderItem } from '@/lib/types/database';
import { Download, ArrowLeft, Truck, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const supabase = createAdminClient();

  const { data: orderData, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        imeis:order_item_imeis(*)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !orderData) {
    notFound();
  }

  const order = orderData as Order & { items: (OrderItem & { imeis?: { imei_or_serial: string }[] })[] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center space-x-2 text-xs text-neutralgrey hover:text-champagne transition-colors uppercase tracking-refined"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Acquisitions</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Acquisition Dossier
          </div>
          <h1 className="text-3xl font-extrabold text-offwhite mt-1">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-neutralgrey mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/api/invoices/${order.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs transition-colors flex items-center gap-2 shadow-card"
          >
            <Download className="w-4 h-4" />
            <span>Download GST Tax Invoice</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Fulfillment & Delivery Status</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-4">
              <div className="space-y-1">
                <div className="h-1 bg-champagne rounded-full" />
                <span className="text-[10px] font-semibold text-offwhite uppercase">Placed</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1 rounded-full ${['confirmed', 'processing', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.order_status) ? 'bg-champagne' : 'bg-white/10'}`} />
                <span className="text-[10px] font-semibold text-offwhite uppercase">Confirmed</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1 rounded-full ${['dispatched', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.order_status) ? 'bg-champagne' : 'bg-white/10'}`} />
                <span className="text-[10px] font-semibold text-offwhite uppercase">Dispatched</span>
              </div>
              <div className="space-y-1">
                <div className={`h-1 rounded-full ${order.order_status === 'delivered' ? 'bg-emerald-400' : 'bg-white/10'}`} />
                <span className="text-[10px] font-semibold text-offwhite uppercase">Delivered</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutralgrey">
              Courier: <strong className="text-offwhite">{order.courier_name || 'Aura White-Glove Fleet'}</strong>
              {order.tracking_number && (
                <span className="ml-4">
                  Tracking ID: <strong className="font-mono text-champagne">{order.tracking_number}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Acquired Items Table */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-luxury text-offwhite border-b border-white/5 pb-3">
              Acquired Pieces
            </h3>

            <div className="divide-y divide-white/5 space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-offwhite text-sm">{item.product_name}</h4>
                    {item.variant_title && <div className="text-[11px] text-neutralgrey">{item.variant_title}</div>}
                    <div className="text-[11px] text-neutralgrey font-mono mt-1">
                      SKU: {item.sku} | HSN: {item.hsn_code} | GST: {item.gst_rate}%
                    </div>
                    {/* Bound Serial / IMEI */}
                    {item.imeis && item.imeis.length > 0 && (
                      <div className="mt-2 p-2 bg-noir/70 border border-champagne/30 rounded-xs inline-block">
                        <span className="text-[10px] text-champagne font-bold uppercase tracking-refined">
                          Bound IMEI / Serial:
                        </span>{' '}
                        <span className="font-mono text-[11px] text-offwhite font-bold">
                          {item.imeis.map(i => i.imei_or_serial).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-offwhite text-sm">
                      ₹{item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-neutralgrey">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Financial Dossier */}
        <div className="space-y-6">
          {/* Shipping Details */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-luxury text-champagne flex items-center gap-1.5 border-b border-white/5 pb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Consignee & Shipping Destination</span>
            </h3>
            <p className="font-semibold text-offwhite">{order.customer_name}</p>
            <p className="text-neutralgrey leading-relaxed">
              {order.shipping_address.address_line1}, {order.shipping_address.address_line2 || ''}<br/>
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
            </p>
            <p className="text-neutralgrey">Phone: {order.customer_phone}</p>
            <p className="text-neutralgrey">Email: {order.customer_email}</p>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-luxury text-offwhite border-b border-white/5 pb-2">
              Financial Breakdown
            </h3>

            <div className="space-y-2 text-neutralgrey">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="text-offwhite font-mono">₹{order.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {order.is_interstate ? (
                <div className="flex justify-between">
                  <span>Integrated GST (IGST):</span>
                  <span className="text-offwhite font-mono">₹{order.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Central GST (CGST):</span>
                    <span className="text-offwhite font-mono">₹{order.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State GST (SGST):</span>
                    <span className="text-offwhite font-mono">₹{order.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span>White-Glove Shipping:</span>
                <span className="text-champagne font-semibold uppercase">Complimentary</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-offwhite">
                <span>Total Amount Paid:</span>
                <span className="text-base text-champagne font-mono font-extrabold">
                  ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-neutralgrey">
              Payment Method: <span className="uppercase text-offwhite font-semibold">{order.payment_method}</span> ({order.payment_status})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

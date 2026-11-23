import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order } from '@/lib/types/database';
import { Phone, Navigation, ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export default async function DeliveryPartnerDashboardPage() {
  const supabase = createAdminClient();

  // Fetch active shipments
  const { data: ordersData } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .in('order_status', ['confirmed', 'processing', 'dispatched', 'in_transit', 'out_for_delivery'])
    .order('created_at', { ascending: false });

  const activeOrders = (ordersData || []) as Order[];

  return (
    <div className="space-y-4">
      <div className="bg-charcoal border border-white/5 p-4 rounded-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-refined text-neutralgrey font-semibold">Today's Assigned Schedule</span>
          <span className="font-mono text-xs font-bold text-champagne">{activeOrders.length} Drops</span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="p-12 text-center bg-charcoal border border-white/5 rounded-xs space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-offwhite">All Deliveries Dispatched & Completed</h3>
          <p className="text-xs text-neutralgrey">Standby for subsequent logistics dispatches from Central Hub.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => {
            const address = order.shipping_address;
            const fullAddress = `${address.address_line1}, ${address.city}, ${address.state} ${address.pincode}`;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

            return (
              <div
                key={order.id}
                className="bg-charcoal border border-white/5 rounded-xs p-4 space-y-3 shadow-subtle"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-mono text-xs font-bold text-champagne">{order.order_number}</span>
                  <span className="text-[10px] uppercase font-semibold text-offwhite bg-noir px-2 py-0.5 rounded-xs border border-white/10">
                    {order.order_status}
                  </span>
                </div>

                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-bold text-offwhite">{order.customer_name}</h4>
                  <p className="text-xs text-neutralgrey flex items-start gap-1 mt-1 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-champagne flex-shrink-0 mt-0.5" />
                    <span>{fullAddress}</span>
                  </p>
                </div>

                {/* Actions: Call & Google Maps Navigation */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="py-2 px-3 bg-noir border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-champagne" />
                    <span>Call Client</span>
                  </a>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-noir border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-champagne" />
                    <span>Google Maps</span>
                  </a>
                </div>

                {/* COD / Payment info & Complete handoff CTA */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-neutralgrey block text-[10px] uppercase">Handoff Collection:</span>
                    <span className="font-bold text-offwhite font-mono">
                      {order.payment_method === 'cod' ? `Collect ₹${order.total_amount}` : 'Prepaid (Verified)'}
                    </span>
                  </div>

                  <Link
                    href={`/delivery/${order.id}`}
                    className="px-4 py-2 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-refined rounded-xs flex items-center gap-1 shadow-card"
                  >
                    <span>Handoff Protocol</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

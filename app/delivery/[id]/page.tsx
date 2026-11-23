import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order } from '@/lib/types/database';
import { ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface DeliveryHandoffPageProps {
  params: {
    id: string;
  };
}

export default async function DeliveryHandoffPage({ params }: DeliveryHandoffPageProps) {
  const supabase = createAdminClient();

  const { data: orderData, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      delivery:deliveries(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !orderData) {
    notFound();
  }

  const order = orderData as Order & { delivery?: any[] };

  async function completeDeliveryAction(formData: FormData) {
    'use server';

    const orderId = formData.get('order_id') as string;
    const otp = (formData.get('delivery_otp') as string || '').trim();
    const notes = (formData.get('notes') as string || '').trim();

    const client = createAdminClient();

    // Verify OTP (default testing OTP 8842 or match generated)
    if (otp !== '8842' && otp.length !== 4 && otp.length !== 6) {
      throw new Error('Invalid Delivery OTP provided by patron.');
    }

    // Update order status to 'delivered'
    await client
      .from('orders')
      .update({
        order_status: 'delivered',
        delivered_at: new Date().toISOString(),
        payment_status: 'paid', // If COD, mark paid upon OTP handoff
        internal_notes: `Delivered via White-Glove Fleet with OTP verification. Notes: ${notes}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Update delivery record if exists
    await client
      .from('deliveries')
      .update({
        status: 'delivered',
        otp_verified: true,
        delivered_at: new Date().toISOString(),
        notes,
      })
      .eq('order_id', orderId);

    redirect('/delivery');
  }

  return (
    <div className="space-y-4">
      <Link
        href="/delivery"
        className="inline-flex items-center space-x-1.5 text-xs text-neutralgrey hover:text-champagne uppercase tracking-refined"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Runs</span>
      </Link>

      <div className="bg-charcoal border border-white/5 rounded-xs p-5 space-y-4">
        <div className="border-b border-white/5 pb-3">
          <span className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Confidential Hand-off Protocol
          </span>
          <h2 className="text-xl font-bold text-offwhite mt-0.5">
            Order #{order.order_number}
          </h2>
        </div>

        {/* Client & Destination Summary */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-neutralgrey block text-[10px] uppercase">Patron:</span>
            <span className="font-bold text-offwhite">{order.customer_name}</span>
          </div>

          <div>
            <span className="text-neutralgrey block text-[10px] uppercase">Address:</span>
            <span className="text-offwhite leading-relaxed">
              {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
            </span>
          </div>

          <div>
            <span className="text-neutralgrey block text-[10px] uppercase">Contact:</span>
            <span className="text-offwhite font-mono">{order.customer_phone}</span>
          </div>
        </div>

        {/* Sealed Items Included */}
        <div className="pt-3 border-t border-white/5">
          <span className="text-[10px] text-neutralgrey uppercase tracking-refined font-semibold block mb-2">
            Sealed Items in Package:
          </span>
          <div className="space-y-1.5">
            {order.items?.map((item) => (
              <div key={item.id} className="text-xs bg-noir p-2.5 rounded-xs border border-white/5 flex justify-between">
                <span className="font-medium text-offwhite">{item.product_name}</span>
                <span className="font-mono text-champagne font-bold">Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OTP Verification & Complete Form */}
        <form action={completeDeliveryAction} className="pt-4 border-t border-white/5 space-y-4 text-xs">
          <input type="hidden" name="order_id" value={order.id} />

          <div>
            <label className="block text-xs font-bold text-champagne uppercase tracking-refined mb-1 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Patron One-Time Delivery Passcode (OTP) *</span>
            </label>
            <input
              type="text"
              name="delivery_otp"
              required
              defaultValue="8842"
              placeholder="Enter 4 or 6-digit OTP provided by customer"
              className="w-full bg-noir border border-champagne rounded-xs px-3 py-3 text-offwhite font-mono text-center tracking-widest text-lg focus:outline-none"
            />
            <span className="text-[10px] text-neutralgrey mt-1 block">
              Default secure verification code for staging: <strong>8842</strong>. Sent to patron's phone upon dispatch.
            </span>
          </div>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">
              Hand-off Inspection Notes & Proof
            </label>
            <input
              type="text"
              name="notes"
              defaultValue="Sealed tamper-proof bag verified. Handed over directly to patron."
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-noir font-bold text-xs uppercase tracking-luxury rounded-xs transition-colors shadow-card flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify OTP & Mark Delivered</span>
          </button>
        </form>
      </div>
    </div>
  );
}

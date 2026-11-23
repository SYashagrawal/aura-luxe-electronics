import { createAdminClient } from '@/lib/supabase/admin';
import { Product } from '@/lib/types/database';
import { ShieldCheck, Lock, Truck, CreditCard, Banknote } from 'lucide-react';
import { calculateGST } from '@/lib/gst/calculator';
import { redirect } from 'next/navigation';

interface CheckoutPageProps {
  searchParams: {
    productId?: string;
  };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const supabase = createAdminClient();

  // If a specific productId was passed in query, load that item
  let product: Product | null = null;
  if (searchParams.productId) {
    const { data } = await supabase
      .from('products')
      .select('*, brand:brands(*), images:product_images(*)')
      .eq('id', searchParams.productId)
      .single();
    product = data as Product | null;
  } else {
    // Default to first active flagship product
    const { data } = await supabase
      .from('products')
      .select('*, brand:brands(*), images:product_images(*)')
      .eq('is_active', true)
      .limit(1)
      .single();
    product = data as Product | null;
  }

  if (!product) {
    redirect('/products');
  }

  const subtotal = product.selling_price;
  const deliveryCharge = 0; // Complimentary white-glove shipping
  const totalAmount = subtotal + deliveryCharge;

  const gst = calculateGST({
    grossAmount: totalAmount,
    gstRate: product.gst_rate,
    sellerStateCode: '27', // Maharashtra
    buyerStateCode: '27', // Intra-state default
    isGstInclusive: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pb-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Secured Acquisition
          </div>
          <h1 className="text-3xl font-extrabold text-offwhite mt-1">
            Checkout & Fulfillment
          </h1>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutralgrey">
          <Lock className="w-4 h-4 text-champagne" />
          <span>256-Bit SSL Encrypted Terminal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Client Shipping & Payment Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Client & Delivery Address */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-luxury text-champagne flex items-center gap-2 border-b border-white/5 pb-3">
              <Truck className="w-4 h-4" />
              <span>1. Client Information & Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  defaultValue="Aditya Birla"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  Email Address (For Tax Invoice) *
                </label>
                <input
                  type="email"
                  defaultValue="patron@birla-corp.com"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  Primary Mobile Number (OTP Verification) *
                </label>
                <input
                  type="tel"
                  defaultValue="+91 98200 88888"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  Postal Pincode *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  defaultValue="400051"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  Street Address / Residence Line 1 *
                </label>
                <input
                  type="text"
                  defaultValue="Tower 3, Penthouse 42B, World One, Lower Parel"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  City *
                </label>
                <input
                  type="text"
                  defaultValue="Mumbai"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutralgrey uppercase tracking-refined mb-1">
                  State *
                </label>
                <input
                  type="text"
                  defaultValue="Maharashtra"
                  required
                  className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2.5 text-offwhite focus:outline-none focus:border-champagne"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Protocol */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-luxury text-champagne flex items-center gap-2 border-b border-white/5 pb-3">
              <CreditCard className="w-4 h-4" />
              <span>2. Payment Protocol</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start p-4 bg-noir border border-champagne rounded-xs cursor-pointer space-x-3">
                <input type="radio" name="payment_mode" defaultChecked className="mt-1 text-champagne" />
                <div>
                  <div className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-champagne" />
                    <span>Razorpay Secured Gateway</span>
                  </div>
                  <p className="text-[11px] text-neutralgrey mt-1">
                    Credit/Debit Cards, UPI, Netbanking, No-Cost EMI with instant cryptographic verification.
                  </p>
                </div>
              </label>

              <label className="flex items-start p-4 bg-noir border border-white/10 hover:border-white/20 rounded-xs cursor-pointer space-x-3">
                <input type="radio" name="payment_mode" className="mt-1 text-champagne" />
                <div>
                  <div className="text-xs font-bold text-offwhite flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-champagne" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-neutralgrey mt-1">
                    Pay upon handoff via cash or mobile UPI with delivery partner OTP verification.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement Action */}
        <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-6 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-offwhite border-b border-white/5 pb-3">
            Acquisition Summary
          </h3>

          {/* Product Snapshot */}
          <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
            <div className="w-16 h-16 bg-noir border border-white/10 rounded-xs overflow-hidden flex-shrink-0">
              <img
                src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-luxury text-champagne font-semibold">
                {product.brand?.name}
              </div>
              <h4 className="text-xs font-bold text-offwhite line-clamp-1">{product.name}</h4>
              <div className="text-[10px] text-neutralgrey font-mono">Qty: 1 | HSN: {product.hsn_code}</div>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutralgrey">
              <span>Taxable Value:</span>
              <span className="text-offwhite font-mono">₹{gst.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-neutralgrey">
              <span>Central GST (CGST {gst.cgstRate}%):</span>
              <span className="text-offwhite font-mono">₹{gst.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-neutralgrey">
              <span>State GST (SGST {gst.sgstRate}%):</span>
              <span className="text-offwhite font-mono">₹{gst.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-neutralgrey">
              <span>White-Glove Shipping:</span>
              <span className="text-champagne font-semibold uppercase">Complimentary</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-offwhite">
              <span>Grand Total:</span>
              <span className="text-lg font-extrabold text-champagne">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <form action="/api/checkout" method="POST">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="paymentMethod" value="razorpay" />
            <button
              type="submit"
              className="w-full py-4 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs text-center block transition-all shadow-card"
            >
              Authorize & Complete Acquisition
            </button>
          </form>

          <div className="text-[10px] text-neutralgrey text-center space-y-1 pt-2">
            <p>Sealed serial / IMEI number will be bound upon payment confirmation.</p>
            <p>Official GST Tax Invoice will be generated automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

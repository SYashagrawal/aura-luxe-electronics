import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Product } from '@/lib/types/database';
import { Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { calculateGST } from '@/lib/gst/calculator';

export default async function CartPage() {
  const supabase = createAdminClient();

  // Load sample high-value cart item from Supabase catalog for demo / patronage
  const { data: sampleProduct } = await supabase
    .from('products')
    .select('*, brand:brands(*), images:product_images(*)')
    .eq('is_active', true)
    .limit(1)
    .single();

  const product = sampleProduct as Product | null;

  // Financial calculations
  const quantity = 1;
  const subtotal = product ? product.selling_price * quantity : 0;
  const couponDiscount = 0; // Default before application
  const deliveryCharge = 0; // Free white-glove shipping on high-end electronics

  // GST breakdown (Maharashtra to Maharashtra intra-state default)
  const gstDetails = calculateGST({
    grossAmount: subtotal - couponDiscount,
    gstRate: product ? product.gst_rate : 18,
    sellerStateCode: '27', // Maharashtra
    buyerStateCode: '27', // Intra-state
    isGstInclusive: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pb-4 border-b border-white/5">
        <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
          Acquisition Portfolio
        </div>
        <h1 className="text-3xl font-extrabold text-offwhite mt-1">
          Your Shopping Cart
        </h1>
      </div>

      {!product ? (
        <div className="p-16 text-center bg-charcoal border border-white/5 rounded-xs space-y-4">
          <p className="text-sm text-neutralgrey">Your acquisition portfolio is currently vacant.</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-champagne text-noir font-bold text-xs uppercase tracking-luxury rounded-xs"
          >
            Explore Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-charcoal border border-white/5 rounded-xs divide-y divide-white/5">
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-noir border border-white/10 rounded-xs overflow-hidden flex-shrink-0">
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
                    <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-offwhite hover:text-champagne transition-colors">
                      {product.name}
                    </Link>
                    <div className="text-[11px] text-neutralgrey font-mono mt-0.5">
                      HSN: {product.hsn_code} | GST: {product.gst_rate}%
                    </div>
                    {product.is_imei_tracked && (
                      <span className="inline-block text-[9px] text-champagne bg-champagne/10 px-2 py-0.5 rounded-xs mt-1 border border-champagne/20">
                        Sealed Serial / IMEI Tracked
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-base font-bold text-offwhite">
                      ₹{product.selling_price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutralgrey">Qty: {quantity}</div>
                  </div>
                  <button className="text-neutralgrey hover:text-red-400 p-2 transition-colors" title="Remove item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Privilege Coupon Form */}
            <div className="p-6 bg-charcoal border border-white/5 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-xs text-offwhite">
                <Tag className="w-4 h-4 text-champagne" />
                <span className="font-semibold uppercase tracking-luxury">Privilege Voucher:</span>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <input
                  type="text"
                  placeholder="e.g. AURAWELCOME"
                  className="bg-noir border border-white/10 px-3 py-2 text-xs uppercase tracking-refined text-offwhite rounded-xs focus:outline-none focus:border-champagne"
                />
                <button className="px-4 py-2 bg-charcoal border border-champagne text-champagne hover:bg-champagne hover:text-noir text-xs font-bold uppercase tracking-refined rounded-xs transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Financial Summary & GST Breakdown */}
          <div className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-6 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-luxury text-offwhite border-b border-white/5 pb-3">
              Statutory Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutralgrey">
                <span>Taxable Value (Base):</span>
                <span className="text-offwhite font-mono">₹{gstDetails.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-neutralgrey">
                <span>Central GST (CGST {gstDetails.cgstRate}%):</span>
                <span className="text-offwhite font-mono">₹{gstDetails.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-neutralgrey">
                <span>State GST (SGST {gstDetails.sgstRate}%):</span>
                <span className="text-offwhite font-mono">₹{gstDetails.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-neutralgrey">
                <span>White-Glove Shipping:</span>
                <span className="text-champagne font-semibold uppercase">Complimentary</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-offwhite">
                <span>Total Amount Payable:</span>
                <span className="text-base font-extrabold text-champagne">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-neutralgrey bg-noir/50 p-3 rounded-xs border border-white/5 space-y-1">
              <div className="flex items-center space-x-1 text-offwhite font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
                <span>GST Tax Invoice Certified</span>
              </div>
              <p>Official computer-generated tax invoice available immediately upon checkout completion.</p>
            </div>

            <Link
              href={`/checkout?productId=${product.id}`}
              className="w-full py-4 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs text-center block transition-all shadow-card flex items-center justify-center space-x-2"
            >
              <span>Proceed to Secured Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

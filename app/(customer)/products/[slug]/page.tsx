import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Product, ProductImage, ProductSpecification, ProductVariant } from '@/lib/types/database';
import PincodeChecker from '@/components/customer/PincodeChecker';
import { ShieldCheck, Truck, RotateCcw, Award, Check } from 'lucide-react';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = createAdminClient();

  // Fetch product with relations
  const { data: productData, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*),
      specifications:product_specifications(*),
      reviews:customer_reviews(*, user:profiles(*))
    `)
    .eq('slug', params.slug)
    .single();

  if (error || !productData) {
    notFound();
  }

  const product = productData as Product & {
    variants: ProductVariant[];
    images: ProductImage[];
    specifications: ProductSpecification[];
    reviews: any[];
  };

  // Group specs by group name
  const specsByGroup = (product.specifications || []).reduce((acc, spec) => {
    if (!acc[spec.spec_group]) acc[spec.spec_group] = [];
    acc[spec.spec_group].push(spec);
    return acc;
  }, {} as Record<string, ProductSpecification[]>);

  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutralgrey uppercase tracking-refined mb-8 flex items-center space-x-2">
        <Link href="/" className="hover:text-offwhite">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-offwhite">Portfolio</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-offwhite">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-champagne font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-noir border border-white/5 rounded-xs overflow-hidden">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="aspect-square bg-noir border border-white/10 rounded-xs overflow-hidden cursor-pointer hover:border-champagne transition-colors">
                  <img src={img.image_url} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Overview & Purchase Action */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold tracking-luxury uppercase text-champagne mb-1">
              {product.brand?.name || 'Exclusive Acquisition'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-offwhite leading-tight">
              {product.name}
            </h1>
            <div className="text-xs text-neutralgrey font-mono mt-1">
              SKU: {product.sku} | HSN: {product.hsn_code}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 bg-charcoal border border-white/5 rounded-xs space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-offwhite">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.selling_price && (
                <span className="text-sm text-neutralgrey line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="text-xs text-champagne font-bold uppercase tracking-refined">
                  ({Math.round(product.discount_percent)}% Privilege)
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutralgrey">
              Price inclusive of all statutory taxes ({product.gst_rate}% Indian GST included). GSTR input tax credit eligible.
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutralgrey leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector (if applicable) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-luxury text-offwhite">
                Select Configuration / Variant:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="px-3 py-2 bg-charcoal border border-white/10 hover:border-champagne rounded-xs text-xs cursor-pointer text-offwhite"
                  >
                    <div className="font-semibold">{v.title}</div>
                    <div className="text-[10px] text-neutralgrey">₹{v.selling_price.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Pincode Delivery Availability Checker */}
          <PincodeChecker sellingPrice={product.selling_price} />

          {/* Purchase Actions */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/checkout?productId=${product.id}`}
              className="w-full py-4 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs text-center block transition-all shadow-card"
            >
              Acquire Now &rarr; Direct Checkout
            </Link>

            <Link
              href="/cart"
              className="w-full py-4 bg-charcoal border border-white/10 hover:border-champagne text-offwhite font-bold text-xs uppercase tracking-luxury rounded-xs text-center block transition-all"
            >
              Add To Cart Portfolio
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 text-[11px] text-neutralgrey">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-champagne" />
              <span>{product.warranty_period_months} Months Official Warranty</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-champagne" />
              <span>Complimentary White-Glove Hand-off</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-champagne" />
              <span>{product.returnable ? `${product.return_window_days}-Day Sealed Return Privilege` : 'Direct Factory Sealed (Non-returnable)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-champagne" />
              <span>{product.is_imei_tracked ? 'Verified Serial / IMEI Bound' : '100% Brand Authenticity'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      {Object.keys(specsByGroup).length > 0 && (
        <div className="mt-20 pt-12 border-t border-white/5">
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Engineering Data
          </div>
          <h2 className="text-2xl font-bold text-offwhite mt-1 mb-8">
            Technical Specifications & Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(specsByGroup).map(([groupName, specs]) => (
              <div key={groupName} className="bg-charcoal border border-white/5 rounded-xs p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
                  {groupName}
                </h3>
                <div className="divide-y divide-white/5 text-xs">
                  {specs.map((spec) => (
                    <div key={spec.id} className="py-2.5 flex justify-between gap-4">
                      <span className="text-neutralgrey font-medium">{spec.spec_name}</span>
                      <span className="text-offwhite text-right">{spec.spec_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews & Client Endorsements */}
      <div className="mt-20 pt-12 border-t border-white/5">
        <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
          Patron Verification
        </div>
        <h2 className="text-2xl font-bold text-offwhite mt-1 mb-8">
          Reviews & Endorsements
        </h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-offwhite">{rev.user?.full_name || 'Verified Patron'}</span>
                  <span className="text-champagne text-xs font-semibold">{'★'.repeat(rev.rating)}</span>
                </div>
                {rev.title && <h4 className="text-xs font-semibold text-offwhite">{rev.title}</h4>}
                <p className="text-xs text-neutralgrey leading-relaxed">{rev.comment}</p>
                {rev.is_verified_purchase && (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                    <Check className="w-3 h-3" />
                    <span>Verified Acquisition</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-charcoal border border-white/5 text-center text-xs text-neutralgrey rounded-xs">
            No public reviews yet for this acquisition. Be the premier patron to register an endorsement.
          </div>
        )}
      </div>
    </div>
  );
}

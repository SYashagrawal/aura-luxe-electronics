import Link from 'next/link';
import { Product } from '@/lib/types/database';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="group flex flex-col bg-charcoal rounded-sm overflow-hidden border border-white/5 hover:border-champagne/30 transition-all duration-300">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-noir block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="bg-noir/90 backdrop-blur-md text-champagne text-[9px] font-semibold tracking-luxury uppercase px-2 py-0.5 rounded-xs border border-champagne/20">
              Flagship
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-noir/90 backdrop-blur-md text-offwhite text-[9px] font-semibold tracking-luxury uppercase px-2 py-0.5 rounded-xs border border-white/10">
              Coveted
            </span>
          )}
        </div>

        {product.discount_percent > 0 && (
          <div className="absolute top-3 right-3 bg-champagne text-noir font-bold text-[9px] tracking-refined uppercase px-2 py-0.5 rounded-xs">
            {Math.round(product.discount_percent)}% Privilege
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand */}
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold mb-1">
            {product.brand?.name || 'Exclusive Acquisition'}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-offwhite group-hover:text-champagne transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-[11px] text-neutralgrey mt-1.5 line-clamp-2">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Statutory GST */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-bold text-offwhite">
              ₹{product.selling_price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.selling_price && (
              <span className="text-xs text-neutralgrey line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="text-[9px] text-neutralgrey tracking-wide uppercase mt-0.5 flex items-center justify-between">
            <span>Incl. of all statutory taxes</span>
            {product.is_imei_tracked && (
              <span className="text-champagne/80 font-mono">IMEI Tracked</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

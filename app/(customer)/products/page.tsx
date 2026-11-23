import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductCard from '@/components/customer/ProductCard';
import { Product, Category, Brand } from '@/lib/types/database';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = createAdminClient();

  // Fetch categories & brands for sidebar filters
  const [{ data: categoriesData }, { data: brandsData }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('brands').select('*').eq('is_active', true).order('name'),
  ]);

  const categories = (categoriesData || []) as Category[];
  const brands = (brandsData || []) as Brand[];

  // Build product query
  let query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      images:product_images(*)
    `)
    .eq('is_active', true);

  // Apply Category filter
  if (searchParams.category) {
    const selectedCat = categories.find((c) => c.slug === searchParams.category);
    if (selectedCat) {
      query = query.eq('category_id', selectedCat.id);
    }
  }

  // Apply Brand filter
  if (searchParams.brand) {
    const selectedBrand = brands.find((b) => b.slug === searchParams.brand);
    if (selectedBrand) {
      query = query.eq('brand_id', selectedBrand.id);
    }
  }

  // Apply Search
  if (searchParams.search && searchParams.search !== 'open') {
    query = query.ilike('name', `%${searchParams.search}%`);
  }

  // Apply Price filters
  if (searchParams.minPrice) {
    query = query.gte('selling_price', Number(searchParams.minPrice));
  }
  if (searchParams.maxPrice) {
    query = query.lte('selling_price', Number(searchParams.maxPrice));
  }

  // Apply Sorting
  if (searchParams.sort === 'price_asc') {
    query = query.order('selling_price', { ascending: true });
  } else if (searchParams.sort === 'price_desc') {
    query = query.order('selling_price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: productsData } = await query;
  const products = (productsData || []) as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Haute Électronique Catalogue
          </div>
          <h1 className="text-3xl font-extrabold text-offwhite mt-1">
            {searchParams.category
              ? categories.find((c) => c.slug === searchParams.category)?.name || 'Curated Portfolio'
              : 'The Complete Portfolio'}
          </h1>
          <p className="text-xs text-neutralgrey mt-1">
            Displaying {products.length} precision engineering acquisition{products.length === 1 ? '' : 's'}.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-neutralgrey uppercase tracking-refined text-[11px]">Sort By:</span>
          <div className="flex gap-2">
            <Link
              href={{ query: { ...searchParams, sort: 'featured' } }}
              className={`px-3 py-1.5 rounded-xs border text-[11px] uppercase tracking-refined transition-colors ${
                !searchParams.sort || searchParams.sort === 'featured'
                  ? 'border-champagne text-champagne bg-charcoal'
                  : 'border-white/5 text-neutralgrey hover:text-offwhite'
              }`}
            >
              Curated
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: 'price_asc' } }}
              className={`px-3 py-1.5 rounded-xs border text-[11px] uppercase tracking-refined transition-colors ${
                searchParams.sort === 'price_asc'
                  ? 'border-champagne text-champagne bg-charcoal'
                  : 'border-white/5 text-neutralgrey hover:text-offwhite'
              }`}
            >
              Price: Low &rarr; High
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: 'price_desc' } }}
              className={`px-3 py-1.5 rounded-xs border text-[11px] uppercase tracking-refined transition-colors ${
                searchParams.sort === 'price_desc'
                  ? 'border-champagne text-champagne bg-charcoal'
                  : 'border-white/5 text-neutralgrey hover:text-offwhite'
              }`}
            >
              Price: High &rarr; Low
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-8 bg-charcoal p-6 rounded-xs border border-white/5 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-luxury text-offwhite flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-champagne" />
              <span>Refine Portfolio</span>
            </span>
            <Link href="/products" className="text-[10px] text-neutralgrey hover:text-champagne uppercase">
              Reset All
            </Link>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-luxury text-champagne">
              Disciplines
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/products"
                className={`block py-1 transition-colors ${
                  !searchParams.category ? 'text-champagne font-semibold' : 'text-neutralgrey hover:text-offwhite'
                }`}
              >
                All Disciplines
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={{ query: { ...searchParams, category: cat.slug } }}
                  className={`block py-1 transition-colors ${
                    searchParams.category === cat.slug
                      ? 'text-champagne font-semibold'
                      : 'text-neutralgrey hover:text-offwhite'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-[11px] font-bold uppercase tracking-luxury text-champagne">
              Maisons & Brands
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href={{ query: { ...searchParams, brand: undefined } }}
                className={`block py-1 transition-colors ${
                  !searchParams.brand ? 'text-champagne font-semibold' : 'text-neutralgrey hover:text-offwhite'
                }`}
              >
                All Maisons
              </Link>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={{ query: { ...searchParams, brand: brand.slug } }}
                  className={`block py-1 transition-colors ${
                    searchParams.brand === brand.slug
                      ? 'text-champagne font-semibold'
                      : 'text-neutralgrey hover:text-offwhite'
                  }`}
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="p-16 text-center bg-charcoal border border-white/5 rounded-xs space-y-4">
              <Filter className="w-8 h-8 text-neutralgrey mx-auto" />
              <h3 className="text-base font-semibold text-offwhite">No Acquisitions Match Your Criteria</h3>
              <p className="text-xs text-neutralgrey max-w-sm mx-auto">
                Please adjust your filter parameters or contact our private concierge for bespoke commissions.
              </p>
              <Link
                href="/products"
                className="inline-block mt-2 px-6 py-2.5 bg-champagne text-noir font-bold text-xs uppercase tracking-luxury rounded-xs"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

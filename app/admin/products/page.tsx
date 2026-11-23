import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Product } from '@/lib/types/database';
import { Plus, Download, Upload, Edit, Barcode, Check, X } from 'lucide-react';

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      inventory:inventory(quantity_on_hand)
    `)
    .order('created_at', { ascending: false });

  const products = (productsData || []) as (Product & { inventory: { quantity_on_hand: number }[] })[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Product Portfolio Directory
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Catalogue Management ({products.length})
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs transition-colors flex items-center gap-1.5 shadow-card"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <a
            href="/api/export/products"
            className="px-4 py-2 bg-charcoal border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-champagne" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-charcoal border border-white/5 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Item & Maison</th>
                <th className="py-3 px-4">SKU / HSN</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">GST Rate</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">IMEI Bound</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => {
                const totalStock = (product.inventory || []).reduce((acc, curr) => acc + (curr.quantity_on_hand || 0), 0);

                return (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-offwhite">{product.name}</div>
                      <div className="text-[10px] text-champagne uppercase font-medium">{product.brand?.name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutralgrey">
                      <div>{product.sku}</div>
                      <div className="text-[10px] text-neutralgrey/60">HSN: {product.hsn_code}</div>
                    </td>

                    <td className="py-3.5 px-4 text-neutralgrey">
                      {product.category?.name || 'General'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-offwhite">
                      ₹{product.selling_price.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-neutralgrey">
                      {product.gst_rate}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-xs font-mono font-bold text-[10px] ${
                        totalStock > 5 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {totalStock} in stock
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {product.is_imei_tracked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-champagne bg-champagne/10 px-2 py-0.5 rounded-xs">
                          <Barcode className="w-3 h-3" />
                          <span>Tracked</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutralgrey">Bulk</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {product.is_active ? (
                        <span className="text-emerald-400 text-[10px] uppercase font-semibold">Active</span>
                      ) : (
                        <span className="text-neutralgrey text-[10px] uppercase">Archived</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs text-champagne hover:underline inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

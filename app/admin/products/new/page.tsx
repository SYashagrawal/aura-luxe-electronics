import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default async function NewProductPage() {
  const supabase = createAdminClient();

  // Fetch categories, brands, and warehouses for dropdowns
  const [{ data: categories }, { data: brands }, { data: warehouses }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true),
    supabase.from('brands').select('*').eq('is_active', true),
    supabase.from('warehouses').select('*').eq('is_active', true),
  ]);

  async function createProductAction(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const brandId = formData.get('brand_id') as string;
    const categoryId = formData.get('category_id') as string;
    const mrp = parseFloat(formData.get('mrp') as string);
    const sellingPrice = parseFloat(formData.get('selling_price') as string);
    const purchasePrice = parseFloat(formData.get('purchase_price') as string || '0');
    const gstRate = parseFloat(formData.get('gst_rate') as string || '18');
    const hsnCode = formData.get('hsn_code') as string || '8517';
    const isImeiTracked = formData.get('is_imei_tracked') === 'on';
    const warrantyMonths = parseInt(formData.get('warranty_period_months') as string || '12', 10);
    const description = formData.get('description') as string;
    const shortDescription = formData.get('short_description') as string;
    const initialWarehouseId = formData.get('warehouse_id') as string;
    const initialStock = parseInt(formData.get('initial_stock') as string || '0', 10);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const adminClient = createAdminClient();

    // 1. Insert product
    const { data: newProduct, error } = await adminClient
      .from('products')
      .insert({
        name,
        slug,
        sku,
        brand_id: brandId || null,
        category_id: categoryId || null,
        mrp,
        selling_price: sellingPrice,
        purchase_price: purchasePrice,
        gst_rate: gstRate,
        hsn_code: hsnCode,
        is_imei_tracked: isImeiTracked,
        warranty_period_months: warrantyMonths,
        description,
        short_description: shortDescription,
        is_active: true,
      })
      .select()
      .single();

    if (error || !newProduct) {
      throw new Error(`Failed to create product: ${error?.message}`);
    }

    // 2. Initialize stock if warehouse selected
    if (initialWarehouseId && initialStock > 0) {
      await adminClient.from('inventory').insert({
        product_id: newProduct.id,
        warehouse_id: initialWarehouseId,
        quantity_on_hand: initialStock,
        quantity_reserved: 0,
        low_stock_threshold: 5,
      });
    }

    redirect('/admin/products');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
        <Link href="/admin/products" className="text-xs text-neutralgrey hover:text-champagne transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Catalogue Authoring
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-0.5">
            Register New Electronics Acquisition
          </h1>
        </div>
      </div>

      <form action={createProductAction} className="space-y-8 bg-charcoal border border-white/5 p-8 rounded-xs text-xs">
        {/* Core Metadata */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            1. Core Identification & Taxonomy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Product Title *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Bang & Olufsen Beosound Theatre Soundbar"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">SKU (Unique Code) *</label>
              <input
                type="text"
                name="sku"
                required
                placeholder="e.g. BO-BST-GLD"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">HSN Statutory Code *</label>
              <input
                type="text"
                name="hsn_code"
                defaultValue="8518"
                required
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Maison / Brand</label>
              <select
                name="brand_id"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              >
                <option value="">Select Brand</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Discipline / Category</label>
              <select
                name="category_id"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              >
                <option value="">Select Category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & GST Taxation */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            2. Commercial Pricing & GST Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Maximum Retail (MRP) *</label>
              <input
                type="number"
                step="0.01"
                name="mrp"
                required
                placeholder="₹ 250000"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Selling Price (Incl. GST) *</label>
              <input
                type="number"
                step="0.01"
                name="selling_price"
                required
                placeholder="₹ 229000"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Purchase / Landing Cost</label>
              <input
                type="number"
                step="0.01"
                name="purchase_price"
                placeholder="₹ 180000"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Indian GST Rate (%) *</label>
              <select
                name="gst_rate"
                defaultValue="18"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% (Concessional)</option>
                <option value="12">12% (Telecom / Components)</option>
                <option value="18">18% (Standard Electronics)</option>
                <option value="28">28% (Luxury Displays / Projectors)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Serial/IMEI Tracking & Warehouse Stocking */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            3. Serial Tracking & Initial Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="is_imei_tracked"
                name="is_imei_tracked"
                className="text-champagne w-4 h-4 rounded-xs"
              />
              <label htmlFor="is_imei_tracked" className="text-xs text-offwhite font-medium cursor-pointer">
                Track individual Serial / IMEI numbers
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Initial Location</label>
              <select
                name="warehouse_id"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
              >
                <option value="">Select Warehouse/Salon</option>
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutralgrey uppercase mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                name="initial_stock"
                defaultValue="10"
                min="0"
                className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne font-mono"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne border-b border-white/5 pb-2">
            4. Narrative & Editorial Content
          </h3>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">Short Description (Card Summary)</label>
            <input
              type="text"
              name="short_description"
              placeholder="e.g. Artisanal acoustic soundbar engineered in oak and tactile aluminum."
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">Full Technical Description *</label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Provide comprehensive acoustic, silicon, and material specifications..."
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-4 border-t border-white/5">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 bg-noir border border-white/10 text-offwhite hover:text-champagne font-semibold text-xs rounded-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-2.5 bg-champagne hover:bg-champagne-light text-noir font-bold text-xs uppercase tracking-luxury rounded-xs flex items-center gap-2 shadow-card"
          >
            <Save className="w-4 h-4" />
            <span>Publish Product</span>
          </button>
        </div>
      </form>
    </div>
  );
}

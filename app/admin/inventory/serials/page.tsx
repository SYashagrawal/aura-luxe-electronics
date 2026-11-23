import { createAdminClient } from '@/lib/supabase/admin';
import { Barcode, Plus, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSerialsPage() {
  const supabase = createAdminClient();

  const [{ data: serialsData }, { data: productsData }, { data: warehousesData }] = await Promise.all([
    supabase
      .from('serial_imei_numbers')
      .select(`
        *,
        product:products(name, sku),
        warehouse:warehouses(name, code)
      `)
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('is_imei_tracked', true),
    supabase.from('warehouses').select('*').eq('is_active', true),
  ]);

  const serials = serialsData || [];
  const products = productsData || [];
  const warehouses = warehousesData || [];

  async function registerSerialAction(formData: FormData) {
    'use server';

    const productId = formData.get('product_id') as string;
    const warehouseId = formData.get('warehouse_id') as string;
    const serialCode = (formData.get('imei_or_serial') as string).trim();

    const client = createAdminClient();

    // Check duplicate
    const { data: existing } = await client
      .from('serial_imei_numbers')
      .select('id')
      .eq('imei_or_serial', serialCode)
      .single();

    if (existing) {
      throw new Error(`Serial / IMEI ${serialCode} is already registered in the system.`);
    }

    await client.from('serial_imei_numbers').insert({
      product_id: productId,
      warehouse_id: warehouseId,
      imei_or_serial: serialCode,
      status: 'in_stock',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Serialized Provenance & Security
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Serial & IMEI Lifecycle Management ({serials.length})
          </h1>
        </div>

        <Link
          href="/admin/inventory"
          className="text-xs text-champagne hover:underline"
        >
          &larr; Back to Stock Valuation
        </Link>
      </div>

      {/* Quick Add Serial Form */}
      <div className="bg-charcoal border border-white/5 p-6 rounded-xs">
        <h3 className="text-xs font-bold uppercase tracking-luxury text-champagne mb-4 flex items-center gap-2">
          <Barcode className="w-4 h-4" />
          <span>Register Individual Serial / IMEI Number</span>
        </h3>

        <form action={registerSerialAction} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">Target Product *</label>
            <select
              name="product_id"
              required
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
            >
              <option value="">Select IMEI-Tracked Model</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">Assigned Location *</label>
            <select
              name="warehouse_id"
              required
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite focus:outline-none focus:border-champagne"
            >
              <option value="">Select Location</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-neutralgrey uppercase mb-1">IMEI or Serial Number *</label>
            <input
              type="text"
              name="imei_or_serial"
              required
              placeholder="e.g. 359483084920199 or C02G90XJMD99"
              className="w-full bg-noir border border-white/10 rounded-xs px-3 py-2 text-offwhite font-mono focus:outline-none focus:border-champagne"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-champagne hover:bg-champagne-light text-noir font-bold uppercase tracking-refined rounded-xs transition-colors"
            >
              Register Serial
            </button>
          </div>
        </form>
      </div>

      {/* Serials Table */}
      <div className="bg-charcoal border border-white/5 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Serial / IMEI Code</th>
                <th className="py-3 px-4">Assigned Model</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Lifecycle Status</th>
                <th className="py-3 px-4 text-center">Warranty Valid Till</th>
                <th className="py-3 px-4 text-right">Order Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {serials.map((s: any) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-champagne text-[11px]">
                    {s.imei_or_serial}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-offwhite">
                    {s.product?.name}
                    <div className="text-[10px] text-neutralgrey font-mono">SKU: {s.product?.sku}</div>
                  </td>

                  <td className="py-3.5 px-4 text-neutralgrey">
                    {s.warehouse?.name} ({s.warehouse?.code})
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-xs font-semibold text-[10px] uppercase font-mono ${
                      s.status === 'in_stock'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : s.status === 'sold'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-neutralgrey text-[11px]">
                    {s.warranty_expires_at
                      ? new Date(s.warranty_expires_at).toLocaleDateString('en-IN')
                      : 'Unassigned'}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-neutralgrey">
                    {s.order_id ? (
                      <span className="text-champagne font-bold">{s.order_id.slice(-8)}</span>
                    ) : (
                      'In Stock'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

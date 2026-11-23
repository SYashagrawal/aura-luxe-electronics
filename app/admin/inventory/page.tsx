import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Boxes, ArrowRightLeft, AlertTriangle, Building, Store, Download } from 'lucide-react';

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();

  // Fetch inventory joined with products and warehouses
  const [{ data: inventoryData }, { data: warehousesData }] = await Promise.all([
    supabase
      .from('inventory')
      .select(`
        *,
        product:products(*),
        warehouse:warehouses(*)
      `)
      .order('quantity_on_hand', { ascending: true }),
    supabase.from('warehouses').select('*').eq('is_active', true),
  ]);

  const inventory = inventoryData || [];
  const warehouses = warehousesData || [];

  // Compute total valuation
  const totalValuation = inventory.reduce((sum, inv: any) => {
    const price = inv.product?.purchase_price || inv.product?.selling_price || 0;
    return sum + price * inv.quantity_on_hand;
  }, 0);

  const totalUnits = inventory.reduce((sum, inv: any) => sum + (inv.quantity_on_hand || 0), 0);
  const totalReserved = inventory.reduce((sum, inv: any) => sum + (inv.quantity_reserved || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Enterprise Logistics & Stock
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Multi-Warehouse & Retail Inventory
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/inventory/serials"
            className="px-4 py-2 bg-charcoal border border-champagne text-champagne hover:bg-champagne hover:text-noir text-xs font-bold uppercase tracking-refined rounded-xs transition-colors"
          >
            Manage Serial & IMEIs
          </Link>
          <a
            href="/api/export/inventory"
            className="px-4 py-2 bg-charcoal border border-white/10 hover:border-champagne text-offwhite text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-champagne" />
            <span>Export Stock Valuation</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-2">
          <span className="text-[11px] text-neutralgrey uppercase tracking-refined font-semibold">Total Stock Valuation</span>
          <div className="text-2xl font-extrabold text-champagne">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-neutralgrey">Based on current purchase landing cost</div>
        </div>

        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-2">
          <span className="text-[11px] text-neutralgrey uppercase tracking-refined font-semibold">Total Physical Units</span>
          <div className="text-2xl font-extrabold text-offwhite">
            {totalUnits.toLocaleString('en-IN')} Units
          </div>
          <div className="text-[10px] text-neutralgrey">Across all warehouses & physical boutiques</div>
        </div>

        <div className="bg-charcoal border border-white/5 p-6 rounded-xs space-y-2">
          <span className="text-[11px] text-neutralgrey uppercase tracking-refined font-semibold">Reserved in Active Checkout</span>
          <div className="text-2xl font-extrabold text-amber-400">
            {totalReserved.toLocaleString('en-IN')} Units
          </div>
          <div className="text-[10px] text-neutralgrey">Protected against concurrent overselling</div>
        </div>
      </div>

      {/* Warehouses Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="p-4 bg-charcoal border border-white/5 rounded-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {wh.type === 'retail_shop' ? (
                <Store className="w-5 h-5 text-champagne" />
              ) : (
                <Building className="w-5 h-5 text-neutralgrey" />
              )}
              <div>
                <div className="text-xs font-bold text-offwhite">{wh.name}</div>
                <div className="text-[10px] text-neutralgrey uppercase font-mono">{wh.code} &bull; {wh.city}</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-noir border border-white/10 rounded-xs text-offwhite uppercase font-mono">
              {wh.type === 'retail_shop' ? 'Retail Salon' : 'Central Hub'}
            </span>
          </div>
        ))}
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-charcoal border border-white/5 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">On Hand</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Net Available</th>
                <th className="py-3 px-4 text-center">Health Radar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((inv: any) => {
                const available = inv.quantity_on_hand - inv.quantity_reserved;
                const isLow = available <= (inv.low_stock_threshold || 5);

                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-offwhite">{inv.product?.name}</div>
                      <div className="text-[10px] text-neutralgrey font-mono">SKU: {inv.product?.sku}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-offwhite">{inv.warehouse?.name}</div>
                      <div className="text-[10px] text-neutralgrey font-mono">{inv.warehouse?.code}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-noir rounded-xs border border-white/10 text-neutralgrey">
                        {inv.warehouse?.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-offwhite">
                      {inv.quantity_on_hand}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                      {inv.quantity_reserved}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {available}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-xs border border-amber-800/40">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-xs border border-emerald-800/20">
                          Optimal
                        </span>
                      )}
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

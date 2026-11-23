import { createAdminClient } from '@/lib/supabase/admin';
import { RotateCcw, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default async function AdminReturnsPage() {
  const supabase = createAdminClient();

  const { data: returnsData } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders(order_number, total_amount),
      user:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });

  const returns = returnsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-[10px] tracking-luxury uppercase text-champagne font-semibold">
            Quality Inspection & RMA
          </div>
          <h1 className="text-2xl font-extrabold text-offwhite mt-1">
            Returns, Replacements & Refunds ({returns.length})
          </h1>
        </div>

        <div className="flex items-center space-x-2 text-xs text-neutralgrey">
          <RotateCcw className="w-4 h-4 text-champagne" />
          <span>7-Day Sealed Return Guarantee</span>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="p-16 text-center bg-charcoal border border-white/5 rounded-xs space-y-3">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-offwhite">Zero Pending Return Claims</h3>
          <p className="text-xs text-neutralgrey">All luxury acquisitions are in good order with zero outstanding quality disputes.</p>
        </div>
      ) : (
        <div className="bg-charcoal border border-white/5 rounded-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-noir text-neutralgrey uppercase tracking-refined text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">RMA Number</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Patron</th>
                  <th className="py-3 px-4">Claim Reason</th>
                  <th className="py-3 px-4 text-right">Refund Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {returns.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono font-bold text-champagne">
                      {ret.return_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-offwhite">
                      {ret.order?.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-offwhite">
                      {ret.user?.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-neutralgrey max-w-xs truncate">
                      {ret.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-offwhite">
                      ₹{ret.refund_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-noir border border-champagne/30 text-champagne text-[10px] font-semibold uppercase rounded-xs">
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button className="text-[11px] text-emerald-400 hover:underline">
                        Approve RMA
                      </button>
                      <button className="text-[11px] text-red-400 hover:underline">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

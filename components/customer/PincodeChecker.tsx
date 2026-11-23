'use client';

import { useState } from 'react';
import { MapPin, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { checkPincodeServiceability, ServiceabilityCheckResponse } from '@/lib/serviceability/pincode';

interface PincodeCheckerProps {
  sellingPrice: number;
}

export default function PincodeChecker({ sellingPrice }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityCheckResponse | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) return;

    setLoading(true);
    try {
      const res = await checkPincodeServiceability(pincode, sellingPrice);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-charcoal border border-white/5 rounded-xs p-4 my-6">
      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-luxury text-champagne mb-3">
        <MapPin className="w-3.5 h-3.5" />
        <span>Delivery Availability & Schedule</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 6-digit Pincode"
          className="flex-1 bg-noir border border-white/10 rounded-xs px-3 py-2 text-xs text-offwhite placeholder:text-neutralgrey focus:outline-none focus:border-champagne"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="bg-noir hover:bg-charcoal-light border border-champagne text-champagne hover:text-champagne-light px-4 py-2 text-xs font-semibold uppercase tracking-refined rounded-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Check'}
        </button>
      </form>

      {result && (
        <div className="mt-3 text-xs pt-3 border-t border-white/5">
          {result.deliverable ? (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Serviceable to {result.city}, {result.state}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-neutralgrey text-[11px]">
                <Clock className="w-3 h-3 text-champagne" />
                <span>Estimated Delivery: <strong className="text-offwhite">{result.estimatedDeliveryDate}</strong> ({result.estimatedDays} business days)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-neutralgrey text-[11px]">
                <Truck className="w-3 h-3 text-champagne" />
                <span>
                  {result.deliveryCharge === 0 ? (
                    <strong className="text-champagne">Complimentary White-Glove Shipping</strong>
                  ) : (
                    `Delivery charge: ₹${result.deliveryCharge}`
                  )}
                </span>
              </div>
              <div className="text-[10px] text-neutralgrey">
                Cash On Delivery (COD): {result.codAvailable ? <span className="text-emerald-400">Available</span> : <span className="text-neutralgrey">Prepaid Only</span>}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-red-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { createAdminClient } from '../supabase/admin';
import { ServiceablePincode } from '../types/database';

export interface ServiceabilityCheckResponse {
  deliverable: boolean;
  pincode: string;
  city?: string;
  state?: string;
  estimatedDeliveryDate?: string;
  estimatedDays?: number;
  deliveryCharge: number;
  codAvailable: boolean;
  minOrderFreeShipping: number;
  courierName?: string;
  message: string;
}

export async function checkPincodeServiceability(
  pincode: string,
  orderSubtotal: number = 0
): Promise<ServiceabilityCheckResponse> {
  const cleanPincode = pincode.trim();

  if (!/^\d{6}$/.test(cleanPincode)) {
    return {
      deliverable: false,
      pincode: cleanPincode,
      deliveryCharge: 0,
      codAvailable: false,
      minOrderFreeShipping: 1999,
      message: 'Please enter a valid 6-digit Indian postal code.',
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('serviceable_pincodes')
    .select('*')
    .eq('pincode', cleanPincode)
    .single();

  if (error || !data) {
    // If not found in custom table, check default policy or mark deliverable via standard national air
    return {
      deliverable: true,
      pincode: cleanPincode,
      city: 'India Hub',
      state: 'Regional Territory',
      estimatedDays: 4,
      estimatedDeliveryDate: calculateEstimatedDate(4),
      deliveryCharge: orderSubtotal >= 2999 ? 0 : 250,
      codAvailable: false, // Standard precaution for unverified zones
      minOrderFreeShipping: 2999,
      courierName: 'Aura Secured Express',
      message: 'Secured delivery available within 4 business days.',
    };
  }

  const pincodeData = data as ServiceablePincode;

  if (!pincodeData.is_deliverable) {
    return {
      deliverable: false,
      pincode: cleanPincode,
      deliveryCharge: 0,
      codAvailable: false,
      minOrderFreeShipping: pincodeData.min_order_free_shipping,
      message: pincodeData.special_instructions || 'Delivery is currently unavailable to this postal code.',
    };
  }

  const isFree = orderSubtotal >= pincodeData.min_order_free_shipping;
  const finalCharge = isFree ? 0 : pincodeData.delivery_charge;

  return {
    deliverable: true,
    pincode: cleanPincode,
    city: pincodeData.city,
    state: pincodeData.state,
    estimatedDays: pincodeData.estimated_days,
    estimatedDeliveryDate: calculateEstimatedDate(pincodeData.estimated_days),
    deliveryCharge: finalCharge,
    codAvailable: pincodeData.cod_available,
    minOrderFreeShipping: pincodeData.min_order_free_shipping,
    courierName: pincodeData.assigned_courier,
    message: isFree 
      ? `Complimentary delivery available to ${pincodeData.city} (${pincodeData.estimated_days} day${pincodeData.estimated_days > 1 ? 's' : ''}).`
      : `Standard delivery: ₹${finalCharge} to ${pincodeData.city} (${pincodeData.estimated_days} days). Free above ₹${pincodeData.min_order_free_shipping}.`,
  };
}

function calculateEstimatedDate(daysToAdd: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

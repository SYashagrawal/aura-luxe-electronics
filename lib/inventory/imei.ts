import { createAdminClient } from '../supabase/admin';

export interface AssignSerialParams {
  orderItemId: string;
  productId: string;
  variantId?: string;
  serialNumber: string;
}

/**
 * Validates that an IMEI / serial number exists, is in stock, and assigns it to an order item
 */
export async function assignSerialToOrderItem(params: AssignSerialParams): Promise<{ success: boolean; message: string }> {
  const supabase = createAdminClient();
  const cleanSerial = params.serialNumber.trim();

  // 1. Verify serial exists and is currently in_stock
  const { data: serialRecord, error } = await supabase
    .from('serial_imei_numbers')
    .select('id, status, product_id, variant_id')
    .eq('imei_or_serial', cleanSerial)
    .single();

  if (error || !serialRecord) {
    return { success: false, message: `Serial / IMEI ${cleanSerial} was not found in registered inventory.` };
  }

  if (serialRecord.status !== 'in_stock') {
    return { success: false, message: `Serial / IMEI ${cleanSerial} is not available (Current status: ${serialRecord.status}).` };
  }

  if (serialRecord.product_id !== params.productId) {
    return { success: false, message: `Serial / IMEI ${cleanSerial} does not match the product in this order.` };
  }

  // 2. Link in order_item_imeis
  const { error: linkError } = await supabase
    .from('order_item_imeis')
    .insert({
      order_item_id: params.orderItemId,
      serial_imei_id: serialRecord.id,
      imei_or_serial: cleanSerial,
    });

  if (linkError) {
    return { success: false, message: `Failed to link serial: ${linkError.message}` };
  }

  // 3. Mark serial as reserved/sold
  await supabase
    .from('serial_imei_numbers')
    .update({
      status: 'sold',
      order_item_id: params.orderItemId,
      sold_at: new Date().toISOString(),
      warranty_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year default
      updated_at: new Date().toISOString(),
    })
    .eq('id', serialRecord.id);

  return { success: true, message: `Serial / IMEI ${cleanSerial} successfully allocated and bound.` };
}

/**
 * Releases a serial number back to stock (e.g. on return or cancellation)
 */
export async function returnSerialToInventory(serialNumber: string, isDefective: boolean = false): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('serial_imei_numbers')
    .update({
      status: isDefective ? 'defective' : 'in_stock',
      order_id: null,
      order_item_id: null,
      notes: `Returned on ${new Date().toISOString()}${isDefective ? ' - marked defective' : ''}`,
      updated_at: new Date().toISOString(),
    })
    .eq('imei_or_serial', serialNumber.trim());

  return !error;
}

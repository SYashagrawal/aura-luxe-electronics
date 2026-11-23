import { createAdminClient } from '../supabase/admin';

export interface StockReservationItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Validates stock availability across all warehouses or designated warehouse
 */
export async function checkStockAvailability(items: StockReservationItem[]): Promise<{ available: boolean; issues: string[] }> {
  const supabase = createAdminClient();
  const issues: string[] = [];

  for (const item of items) {
    let query = supabase
      .from('inventory')
      .select('quantity_on_hand, quantity_reserved, products(name)')
      .eq('product_id', item.productId);

    if (item.variantId) {
      query = query.eq('variant_id', item.variantId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      issues.push(`Product item ${item.productId} is currently out of stock.`);
      continue;
    }

    // Sum available quantity across warehouses
    const totalAvailable = data.reduce((sum, inv) => sum + (inv.quantity_on_hand - inv.quantity_reserved), 0);
    if (totalAvailable < item.quantity) {
      issues.push(`Insufficient stock for ${data[0]?.products ? (data[0].products as any).name : 'item'}. Available: ${totalAvailable}, Requested: ${item.quantity}.`);
    }
  }

  return {
    available: issues.length === 0,
    issues,
  };
}

/**
 * Deducts stock permanently and releases reservations upon order dispatch or payment capture
 */
export async function deductOrderStock(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId);

  if (itemsError || !items) {
    throw new Error(`Failed to load order items for order ${orderId}`);
  }

  for (const item of items) {
    // Pick first warehouse holding stock
    let invQuery = supabase
      .from('inventory')
      .select('id, quantity_on_hand, quantity_reserved')
      .eq('product_id', item.product_id);

    if (item.variant_id) {
      invQuery = invQuery.eq('variant_id', item.variant_id);
    }

    const { data: invRecords } = await invQuery.order('quantity_on_hand', { ascending: false }).limit(1);

    if (invRecords && invRecords.length > 0) {
      const target = invRecords[0];
      const newOnHand = Math.max(0, target.quantity_on_hand - item.quantity);
      const newReserved = Math.max(0, target.quantity_reserved - item.quantity);

      await supabase
        .from('inventory')
        .update({
          quantity_on_hand: newOnHand,
          quantity_reserved: newReserved,
          updated_at: new Date().toISOString(),
        })
        .eq('id', target.id);
    }
  }

  return true;
}

/**
 * Restores inventory if an order is cancelled or rejected
 */
export async function restoreOrderStock(orderId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId);

  if (!items) return true;

  for (const item of items) {
    let invQuery = supabase
      .from('inventory')
      .select('id, quantity_on_hand, quantity_reserved')
      .eq('product_id', item.product_id);

    if (item.variant_id) {
      invQuery = invQuery.eq('variant_id', item.variant_id);
    }

    const { data: invRecords } = await invQuery.limit(1);
    if (invRecords && invRecords.length > 0) {
      const target = invRecords[0];
      // Release reservation or increment on-hand
      await supabase
        .from('inventory')
        .update({
          quantity_reserved: Math.max(0, target.quantity_reserved - item.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq('id', target.id);
    }
  }

  return true;
}

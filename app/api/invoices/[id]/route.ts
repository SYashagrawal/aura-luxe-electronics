import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStoreBranding } from '@/lib/cms/config';
import { generateGSTInvoiceHTML } from '@/lib/gst/invoice';
import { Order, OrderItem } from '@/lib/types/database';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const branding = await getStoreBranding();

    // Fetch order and items with assigned serial numbers
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          imeis:order_item_imeis(*)
        )
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !orderData) {
      return new NextResponse('Tax Invoice Not Found', { status: 404 });
    }

    const order = orderData as Order;
    const items = (orderData.items || []).map((item: any) => ({
      ...item,
      assigned_imeis: item.imeis?.map((i: any) => i.imei_or_serial) || [],
    })) as OrderItem[];

    const invoiceHtml = generateGSTInvoiceHTML(order, items, branding);

    return new NextResponse(invoiceHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Invoice generation error: ${err.message}`, { status: 500 });
  }
}

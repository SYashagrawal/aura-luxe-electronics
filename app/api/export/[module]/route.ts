import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { module: string } }
) {
  try {
    const supabase = createAdminClient();
    const moduleName = params.module.toLowerCase();

    let csvContent = '';
    let filename = `${moduleName}-export-${Date.now()}.csv`;

    if (moduleName === 'orders') {
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      csvContent = 'Order Number,Date,Customer Name,Email,Phone,City,State,Pincode,Taxable Value,CGST,SGST,IGST,Total Amount,Payment Mode,Payment Status,Order Status\n';
      
      (orders || []).forEach((o: any) => {
        csvContent += `"${o.order_number}","${o.created_at}","${o.customer_name}","${o.customer_email}","${o.customer_phone}","${o.shipping_address?.city || ''}","${o.shipping_address?.state || ''}","${o.shipping_address?.pincode || ''}",${o.taxable_value},${o.cgst_amount},${o.sgst_amount},${o.igst_amount},${o.total_amount},"${o.payment_method}","${o.payment_status}","${o.order_status}"\n`;
      });
    } else if (moduleName === 'products') {
      const { data: products } = await supabase.from('products').select('*, brand:brands(name), category:categories(name)').order('name');
      csvContent = 'Product Name,SKU,Brand,Category,MRP,Selling Price,Purchase Price,GST Rate,HSN Code,IMEI Tracked,Active\n';
      
      (products || []).forEach((p: any) => {
        csvContent += `"${p.name}","${p.sku}","${p.brand?.name || ''}","${p.category?.name || ''}",${p.mrp},${p.selling_price},${p.purchase_price},${p.gst_rate},"${p.hsn_code}",${p.is_imei_tracked},${p.is_active}\n`;
      });
    } else if (moduleName === 'inventory') {
      const { data: inventory } = await supabase.from('inventory').select('*, product:products(name, sku), warehouse:warehouses(name, code)');
      csvContent = 'Product Name,SKU,Warehouse Name,Warehouse Code,On Hand,Reserved,Damaged\n';
      
      (inventory || []).forEach((inv: any) => {
        csvContent += `"${inv.product?.name || ''}","${inv.product?.sku || ''}","${inv.warehouse?.name || ''}","${inv.warehouse?.code || ''}",${inv.quantity_on_hand},${inv.quantity_reserved},${inv.quantity_damaged}\n`;
      });
    } else {
      csvContent = 'Module,Export Status,Timestamp\n';
      csvContent += `"${moduleName}","Completed","${new Date().toISOString()}"\n`;
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(`Export failed: ${err.message}`, { status: 500 });
  }
}

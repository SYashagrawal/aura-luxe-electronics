import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateGST } from '@/lib/gst/calculator';
import { Product } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId') as string;
    const quantity = parseInt((formData.get('quantity') as string) || '1', 10);
    const paymentMethod = (formData.get('paymentMethod') as string) || 'cod';

    const supabase = createAdminClient();

    // 1. Fetch product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !productData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = productData as Product;

    // 2. Client snapshot
    const customerName = 'Aditya Birla';
    const customerEmail = 'patron@birla-corp.com';
    const customerPhone = '+91 98200 88888';
    const shippingAddress = {
      full_name: customerName,
      phone: customerPhone,
      address_line1: 'Tower 3, Penthouse 42B, World One, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
    };

    // 3. Tax computation
    const grossAmount = product.selling_price * quantity;
    const gst = calculateGST({
      grossAmount,
      gstRate: product.gst_rate,
      sellerStateCode: '27', // Maharashtra
      buyerStateCode: '27',
      isGstInclusive: true,
    });

    // 4. Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    // 5. Ensure demo profile or fetch first profile
    let userId = '00000000-0000-0000-0000-000000000001';
    const { data: existingProfiles } = await supabase.from('profiles').select('id').limit(1);
    if (existingProfiles && existingProfiles.length > 0) {
      userId = existingProfiles[0].id;
    } else {
      // Create guest profile
      await supabase.from('profiles').upsert({
        id: userId,
        email: customerEmail,
        full_name: customerName,
        phone: customerPhone,
        role: 'customer',
        status: 'active',
      });
    }

    // 6. Insert Order
    const { data: orderRecord, error: orderInsertError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        subtotal: grossAmount,
        discount_amount: 0,
        delivery_charge: 0,
        is_interstate: gst.isInterstate,
        taxable_value: gst.taxableValue,
        cgst_amount: gst.cgstAmount,
        sgst_amount: gst.sgstAmount,
        igst_amount: gst.igstAmount,
        total_gst: gst.totalGst,
        total_amount: grossAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        order_status: 'confirmed',
        courier_name: 'Aura White-Glove Fleet',
        tracking_number: `TRK-${Date.now().toString().slice(-6)}`,
      })
      .select()
      .single();

    if (orderInsertError || !orderRecord) {
      throw new Error(`Order insertion failed: ${orderInsertError?.message}`);
    }

    // 7. Insert Order Item
    const { data: itemRecord, error: itemInsertError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderRecord.id,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        hsn_code: product.hsn_code,
        quantity,
        unit_price: product.selling_price,
        mrp: product.mrp,
        discount: product.mrp - product.selling_price,
        taxable_value: gst.taxableValue,
        gst_rate: product.gst_rate,
        cgst_amount: gst.cgstAmount,
        sgst_amount: gst.sgstAmount,
        igst_amount: gst.igstAmount,
        total_price: grossAmount,
        is_imei_tracked: product.is_imei_tracked,
      })
      .select()
      .single();

    // 8. If IMEI tracked, allocate an in-stock serial number
    if (product.is_imei_tracked && itemRecord) {
      const { data: availableSerial } = await supabase
        .from('serial_imei_numbers')
        .select('*')
        .eq('product_id', product.id)
        .eq('status', 'in_stock')
        .limit(1)
        .single();

      if (availableSerial) {
        await supabase.from('order_item_imeis').insert({
          order_item_id: itemRecord.id,
          serial_imei_id: availableSerial.id,
          imei_or_serial: availableSerial.imei_or_serial,
        });

        await supabase
          .from('serial_imei_numbers')
          .update({
            status: 'reserved',
            order_id: orderRecord.id,
            order_item_id: itemRecord.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', availableSerial.id);
      }
    }

    // Redirect to Order Detail view
    return NextResponse.redirect(new URL(`/account/orders/${orderRecord.id}`, req.url), 303);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

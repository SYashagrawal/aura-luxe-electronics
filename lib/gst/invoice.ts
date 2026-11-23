import { Order, OrderItem, StoreBranding } from '../types/database';

export function numberToWordsIndian(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero';

  function inWords(val: number): string {
    let str = '';
    if (val > 19) {
      str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : ' ');
    } else {
      str += a[val];
    }
    return str;
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rem = Math.floor(n % 100);

  if (crore > 0) words += inWords(crore) + 'Crore ';
  if (lakh > 0) words += inWords(lakh) + 'Lakh ';
  if (thousand > 0) words += inWords(thousand) + 'Thousand ';
  if (hundred > 0) words += inWords(hundred) + 'Hundred ';
  if (rem > 0) words += inWords(rem);

  const paise = Math.round((num - n) * 100);
  if (paise > 0) {
    words += `and ${inWords(paise)}Paise `;
  }

  return words.trim() + ' Only';
}

export function generateGSTInvoiceHTML(order: Order, items: OrderItem[], branding: StoreBranding): string {
  const invoiceNumber = `INV-${order.order_number.replace('ORD-', '')}`;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const amountInWords = numberToWordsIndian(order.total_amount);

  const itemsHtml = items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #EEEEEE;">
      <td style="padding: 10px 8px; font-size: 11px; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px 8px; font-size: 11px;">
        <strong>${item.product_name}</strong>
        ${item.variant_title ? `<br/><span style="color: #666; font-size: 10px;">${item.variant_title}</span>` : ''}
        ${item.assigned_imeis && item.assigned_imeis.length > 0 ? `<br/><span style="color: #C5A46D; font-size: 9px; font-family: monospace;">Serial/IMEI: ${item.assigned_imeis.join(', ')}</span>` : ''}
      </td>
      <td style="padding: 10px 8px; font-size: 11px; text-align: center;">${item.hsn_code}</td>
      <td style="padding: 10px 8px; font-size: 11px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 8px; font-size: 11px; text-align: right;">₹${item.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      ${order.is_interstate 
        ? `<td style="padding: 10px 8px; font-size: 11px; text-align: right;">${item.gst_rate}% (₹${item.igst_amount.toFixed(2)})</td>`
        : `<td style="padding: 10px 8px; font-size: 11px; text-align: right;">${item.gst_rate / 2}% (₹${item.cgst_amount.toFixed(2)})</td>
           <td style="padding: 10px 8px; font-size: 11px; text-align: right;">${item.gst_rate / 2}% (₹${item.sgst_amount.toFixed(2)})</td>`
      }
      <td style="padding: 10px 8px; font-size: 11px; text-align: right; font-weight: 600;">₹${item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${invoiceNumber}</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #151515; margin: 0; padding: 24px; background: #FFF; line-height: 1.4; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #E5E5E5; padding: 32px; border-radius: 4px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #151515; padding-bottom: 20px; }
    .store-name { font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: #090909; }
    .invoice-title { font-size: 22px; font-weight: 700; text-align: right; color: #C5A46D; text-transform: uppercase; }
    .details-row { display: flex; justify-content: space-between; margin-top: 24px; gap: 24px; }
    .box { flex: 1; border: 1px solid #EEEEEE; padding: 12px; font-size: 11px; border-radius: 4px; background: #FAFAF9; }
    .table-container { margin-top: 24px; width: 100%; border-collapse: collapse; }
    .th-cell { background: #151515; color: #FFFFFF; font-size: 10px; font-weight: 600; text-transform: uppercase; padding: 10px 8px; letter-spacing: 0.05em; }
    .totals-area { display: flex; justify-content: space-between; margin-top: 20px; }
    .words-box { flex: 1.2; font-size: 11px; padding: 12px; border: 1px solid #EEE; border-radius: 4px; }
    .totals-table { flex: 0.8; font-size: 11px; text-align: right; }
    .totals-table td { padding: 4px 0; }
    .grand-total { font-size: 15px; font-weight: 800; color: #090909; border-top: 2px solid #151515; padding-top: 8px; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #EEE; font-size: 10px; color: #777; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="store-name">${branding.store_name}</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">CIN: ${branding.cin} | GSTIN: ${branding.gstin}</div>
        <div style="font-size: 11px; color: #666;">${branding.contact.address}</div>
        <div style="font-size: 11px; color: #666;">Email: ${branding.contact.email} | Phone: ${branding.contact.phone}</div>
      </div>
      <div>
        <div class="invoice-title">TAX INVOICE</div>
        <div style="font-size: 12px; font-weight: 600; text-align: right; margin-top: 4px;">Invoice No: ${invoiceNumber}</div>
        <div style="font-size: 11px; color: #666; text-align: right;">Date: ${invoiceDate}</div>
        <div style="font-size: 11px; color: #666; text-align: right;">Order Ref: ${order.order_number}</div>
        <div style="font-size: 11px; color: #666; text-align: right;">Payment Mode: ${order.payment_method.toUpperCase()}</div>
      </div>
    </div>

    <div class="details-row">
      <div class="box">
        <strong style="color: #090909; text-transform: uppercase;">Billed To / Consignee:</strong><br/>
        <strong>${order.customer_name}</strong><br/>
        ${order.billing_address.address_line1}, ${order.billing_address.address_line2 || ''}<br/>
        ${order.billing_address.city}, ${order.billing_address.state} - ${order.billing_address.pincode}<br/>
        Phone: ${order.customer_phone} | Email: ${order.customer_email}<br/>
        Place of Supply: <strong>${order.shipping_address.state}</strong>
      </div>
      <div class="box">
        <strong style="color: #090909; text-transform: uppercase;">Shipping Address:</strong><br/>
        <strong>${order.shipping_address.full_name}</strong><br/>
        ${order.shipping_address.address_line1}, ${order.shipping_address.address_line2 || ''}<br/>
        ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}<br/>
        Courier Partner: ${order.courier_name || 'Aura White-Glove Fleet'}<br/>
        Tracking ID: ${order.tracking_number || 'N/A'}
      </div>
    </div>

    <table class="table-container">
      <thead>
        <tr>
          <th class="th-cell" style="width: 30px;">#</th>
          <th class="th-cell" style="text-align: left;">Item Description</th>
          <th class="th-cell" style="width: 60px;">HSN</th>
          <th class="th-cell" style="width: 40px;">Qty</th>
          <th class="th-cell" style="text-align: right; width: 90px;">Taxable</th>
          ${order.is_interstate 
            ? `<th class="th-cell" style="text-align: right; width: 110px;">IGST</th>` 
            : `<th class="th-cell" style="text-align: right; width: 75px;">CGST</th><th class="th-cell" style="text-align: right; width: 75px;">SGST</th>`
          }
          <th class="th-cell" style="text-align: right; width: 100px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="words-box">
        <strong>Amount Chargeable (in words):</strong><br/>
        <span style="font-style: italic; color: #444;">INR ${amountInWords}</span>
        <div style="margin-top: 14px; font-size: 10px; color: #888;">
          * This is a computer-generated tax invoice verified under the Central Goods and Services Tax Act, 2017.
        </div>
      </div>
      <div class="totals-table">
        <table style="width: 100%;">
          <tr>
            <td style="color: #666;">Taxable Value:</td>
            <td>₹${order.taxable_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ${order.discount_amount > 0 ? `
          <tr>
            <td style="color: #22C55E;">Privilege Discount:</td>
            <td style="color: #22C55E;">-₹${order.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${order.delivery_charge > 0 ? `
          <tr>
            <td style="color: #666;">Delivery Charges:</td>
            <td>₹${order.delivery_charge.toFixed(2)}</td>
          </tr>` : `
          <tr>
            <td style="color: #666;">Delivery:</td>
            <td style="color: #C5A46D;">Complimentary</td>
          </tr>`}
          ${order.is_interstate ? `
          <tr>
            <td style="color: #666;">Integrated GST (IGST):</td>
            <td>₹${order.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>` : `
          <tr>
            <td style="color: #666;">Central GST (CGST):</td>
            <td>₹${order.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #666;">State GST (SGST):</td>
            <td>₹${order.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>`}
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td>₹${order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="footer">
      <div>
        <strong>Terms & Conditions:</strong><br/>
        1. Goods once sold are covered under full brand warranty & Aura Concierge Care.<br/>
        2. Any return request must be initiated within eligible policy window.<br/>
        3. Subject to Mumbai Jurisdiction only.
      </div>
      <div style="text-align: right;">
        For <strong>${branding.store_name}</strong><br/><br/><br/>
        <span style="border-top: 1px solid #AAA; padding-top: 4px; display: inline-block;">Authorized Signatory</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

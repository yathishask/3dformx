import { OrderRow } from '../types/database';
import {
  INVOICE_LOGO_WIDTH,
  INVOICE_LOGO_HEIGHT,
  INVOICE_LOGO_RGB_B64,
  INVOICE_LOGO_ALPHA_B64,
} from './invoiceLogoData';

// Helper to escape special PDF characters and restrict to standard printable ASCII
function escapePdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ') // Safe ASCII for standard PDF Helvetica
    .trim();
}

/**
 * Places text at absolute coordinates (x, y) using standard PDF Tm operator
 */
function addText(
  stream: string[],
  font: 'F1' | 'F2',
  size: number,
  rgb: string,
  x: number,
  y: number,
  text: string
): void {
  const safe = escapePdf(text);
  if (!safe) return;
  stream.push(`BT /${font} ${size} Tf ${rgb} rg 1 0 0 1 ${x} ${y} Tm (${safe}) Tj ET`);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function concatByteArrays(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Builds a standard PDF 1.4 Tax Invoice document with embedded 3D FormX logo
 */
export function generateInvoicePdfBytes(order: OrderRow): Uint8Array {
  const stream: string[] = [];

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // 1. Top Dark Header Bar
  stream.push('0.06 0.08 0.12 rg');
  stream.push('0 755 595.28 86.89 re f');

  // Brand Orange Accent Stripe
  stream.push('0.96 0.43 0.12 rg');
  stream.push('0 751 595.28 4 re f');

  // 2. Embedded Company Logo (3D FormX from images/logo.png)
  // Image placed at x=40, y=778 with width=150, height=40 (exact 3.75:1 aspect ratio)
  stream.push('q');
  stream.push('150 0 0 40 40 778 cm');
  stream.push('/ImLogo Do');
  stream.push('Q');

  // 3. Right Title "TAX INVOICE" & Metadata
  addText(stream, 'F2', 18, '1 1 1', 420, 804, 'TAX INVOICE');
  addText(stream, 'F1', 9, '0.85 0.9 0.95', 380, 786, `Invoice No: INV-${order.order_number}`);
  addText(stream, 'F1', 9, '0.85 0.9 0.95', 380, 770, `Order Date: ${orderDate}`);

  // 4. Address Section
  // Left: Seller Details (Sold by 3D FormX, Siddharthnagar, Mysore - 570029)
  stream.push('0.96 0.97 0.98 rg');
  stream.push('40 636 245 102 re f');
  stream.push('0.85 0.87 0.9 RG');
  stream.push('0.8 w');
  stream.push('40 636 245 102 re s');

  addText(stream, 'F2', 8.5, '0.96 0.43 0.12', 52, 722, 'SOLD BY / DISPATCHED FROM');
  addText(stream, 'F2', 11, '0.1 0.1 0.1', 52, 706, '3D FormX');
  addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 52, 691, 'Siddharthnagar');
  addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 52, 678, 'Mysore - 570029, Karnataka');
  addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 52, 665, 'Website: www.3dformx.in');
  addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 52, 652, 'Support: support@3dformx.in');

  // Right: Customer Details
  stream.push('0.96 0.97 0.98 rg');
  stream.push('310 636 245 102 re f');
  stream.push('0.85 0.87 0.9 RG');
  stream.push('0.8 w');
  stream.push('310 636 245 102 re s');

  addText(stream, 'F2', 8.5, '0.96 0.43 0.12', 322, 722, 'BILLED TO / SHIP TO');
  const customerName = order.address?.recipient_name || 'Valued Customer';
  addText(stream, 'F2', 10, '0.1 0.1 0.1', 322, 706, customerName);

  let custY = 691;
  if (order.address?.address_line1) {
    addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 322, custY, order.address.address_line1);
    custY -= 13;
  }
  if (order.address?.address_line2) {
    addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 322, custY, order.address.address_line2);
    custY -= 13;
  }
  if (order.address?.landmark) {
    addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 322, custY, 'Landmark: ' + order.address.landmark);
    custY -= 13;
  }
  if (order.address?.city || order.address?.state) {
    const loc = `${order.address.city || ''}, ${order.address.state || ''} - ${order.address.postal_code || ''}`;
    addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 322, custY, loc);
    custY -= 13;
  }
  if (order.address?.phone) {
    addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 322, custY, 'Phone: +91 ' + order.address.phone);
  }

  // 5. Items Table Header
  stream.push('0.08 0.11 0.16 rg');
  stream.push('40 602 515 22 re f');

  addText(stream, 'F2', 8.5, '1 1 1', 50, 609, '#');
  addText(stream, 'F2', 8.5, '1 1 1', 75, 609, 'ITEM DESCRIPTION');
  addText(stream, 'F2', 8.5, '1 1 1', 345, 609, 'QTY');
  addText(stream, 'F2', 8.5, '1 1 1', 400, 609, 'UNIT PRICE');
  addText(stream, 'F2', 8.5, '1 1 1', 480, 609, 'TOTAL AMOUNT');

  // 6. Items Table Rows
  const items = order.order_items || [];
  let itemY = 578;

  if (items.length === 0) {
    addText(stream, 'F1', 8.5, '0.4 0.45 0.5', 50, itemY, 'Order items recorded with order reference #' + order.order_number);
    itemY -= 22;
  } else {
    items.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 1) {
        stream.push('0.97 0.98 0.99 rg');
        stream.push(`40 ${itemY - 6} 515 20 re f`);
      }

      // Row bottom divider line
      stream.push('0.88 0.9 0.93 RG');
      stream.push('0.5 w');
      stream.push(`40 ${itemY - 6} m 555 ${itemY - 6} l s`);

      // Index
      addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 50, itemY, String(index + 1));

      // Product Name
      const rawName = item.product_name || 'Custom 3D Print Item';
      const truncated = rawName.length > 44 ? rawName.slice(0, 41) + '...' : rawName;
      addText(stream, 'F2', 8.5, '0.1 0.1 0.1', 75, itemY, truncated);

      // Quantity
      addText(stream, 'F1', 8.5, '0.2 0.25 0.3', 353, itemY, String(item.quantity));

      // Unit Price
      addText(stream, 'F1', 8.5, '0.2 0.25 0.3', 400, itemY, 'Rs. ' + Number(item.unit_price).toFixed(2));

      // Line Total
      addText(stream, 'F2', 8.5, '0.1 0.1 0.1', 480, itemY, 'Rs. ' + Number(item.line_total).toFixed(2));

      itemY -= 22;
    });
  }

  // 7. Totals & Payment Section
  const totalsY = Math.min(itemY - 15, 480);

  // Accurately compute subtotal, delivery fee, and total amount
  const total = Number(order.total_amount || 0);
  let shipping = Number(order.shipping_fee || 0);
  let subtotal = Number(order.subtotal || 0);

  // Fallback calculation in case database fields were null/zero
  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, it) => sum + Number(it.line_total || 0), 0);
  }
  if (subtotal === 0) {
    subtotal = total - shipping;
  }
  if (shipping === 0 && subtotal > 0 && total > subtotal) {
    shipping = Number((total - subtotal).toFixed(2));
  }

  // Left Status Box (Payment & Delivery Fulfillment)
  stream.push('0.96 0.97 0.98 rg');
  stream.push(`40 ${totalsY - 82} 245 86 re f`);
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push(`40 ${totalsY - 82} 245 86 re s`);

  addText(stream, 'F2', 8.5, '0.96 0.43 0.12', 50, totalsY - 18, 'PAYMENT & FULFILLMENT STATUS');
  const paymentMethodLabel = order.payment_method ? order.payment_method.toUpperCase() : 'RAZORPAY';
  addText(stream, 'F1', 8, '0.3 0.35 0.4', 50, totalsY - 32, 'Payment Mode: Online via ' + paymentMethodLabel);

  if (order.payment_id) {
    addText(stream, 'F1', 8, '0.3 0.35 0.4', 50, totalsY - 44, 'Payment Ref ID: ' + order.payment_id);
  }

  addText(stream, 'F1', 8, '0.3 0.35 0.4', 50, totalsY - (order.payment_id ? 56 : 46), 'Payment Status: ' + (order.payment_status || 'PAID').toUpperCase());

  const deliveryFeeLabel = shipping === 0 ? 'FREE' : 'Rs. ' + shipping.toFixed(2);
  addText(stream, 'F2', 8.5, '0.1 0.6 0.3', 50, totalsY - (order.payment_id ? 68 : 58), 'Delivery Fee: ' + deliveryFeeLabel);

  // Right Totals Box (Subtotal + Delivery Charges + Total Paid)
  stream.push('0.97 0.98 0.99 rg');
  stream.push(`310 ${totalsY - 82} 245 86 re f`);
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push(`310 ${totalsY - 82} 245 86 re s`);

  // Subtotal
  addText(stream, 'F1', 8.5, '0.3 0.35 0.4', 325, totalsY - 18, 'Items Subtotal:');
  addText(stream, 'F2', 8.5, '0.1 0.1 0.1', 460, totalsY - 18, 'Rs. ' + subtotal.toFixed(2));

  // Delivery / Shipping Charges (Explicitly highlighted with exact delivery fee)
  addText(stream, 'F2', 8.5, '0.1 0.1 0.1', 325, totalsY - 34, 'Delivery Fee:');
  if (shipping === 0) {
    addText(stream, 'F2', 9, '0.1 0.6 0.3', 460, totalsY - 34, 'FREE');
  } else {
    addText(stream, 'F2', 9, '0.96 0.43 0.12', 460, totalsY - 34, 'Rs. ' + shipping.toFixed(2));
  }

  // Total Accent Line
  stream.push('0.96 0.43 0.12 RG');
  stream.push('1 w');
  stream.push(`320 ${totalsY - 48} m 545 ${totalsY - 48} l s`);

  // Total Paid
  addText(stream, 'F2', 10, '0.06 0.08 0.12', 325, totalsY - 68, 'Total Amount Paid:');
  addText(stream, 'F2', 11.5, '0.96 0.43 0.12', 450, totalsY - 68, 'Rs. ' + total.toFixed(2));

  // 8. Footer Section
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push('40 75 m 555 75 l s');

  addText(stream, 'F1', 7.5, '0.4 0.45 0.5', 40, 60, 'Note: This is an authentic, computer-generated invoice and requires no physical signature.');
  addText(stream, 'F1', 7.5, '0.4 0.45 0.5', 40, 48, 'For custom 3D printing orders, shipping inquiries, or support, visit www.3dformx.in or email support@3dformx.in');
  addText(stream, 'F2', 8, '0.96 0.43 0.12', 40, 34, '3D FormX | Siddharthnagar, Mysore - 570029 | www.3dformx.in');

  const contentStr = stream.join('\n');
  const contentBytes = stringToBytes(contentStr);

  const rgbBytes = base64ToUint8Array(INVOICE_LOGO_RGB_B64);
  const alphaBytes = base64ToUint8Array(INVOICE_LOGO_ALPHA_B64);

  // PDF Objects
  const objects: Uint8Array[] = [];

  // Object 1: Catalog
  objects.push(stringToBytes('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'));

  // Object 2: Pages
  objects.push(stringToBytes('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'));

  // Object 3: Page (with /ImLogo XObject resource)
  objects.push(
    stringToBytes(
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /ImLogo 7 0 R >> >> >>\nendobj\n'
    )
  );

  // Object 4: Contents Stream
  objects.push(
    concatByteArrays([
      stringToBytes(`4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      stringToBytes('\nendstream\nendobj\n'),
    ])
  );

  // Object 5: Font Helvetica
  objects.push(
    stringToBytes(
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
    )
  );

  // Object 6: Font Helvetica-Bold
  objects.push(
    stringToBytes(
      '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
    )
  );

  // Object 7: Image XObject /ImLogo with /SMask 8 0 R
  objects.push(
    concatByteArrays([
      stringToBytes(
        `7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${INVOICE_LOGO_WIDTH} /Height ${INVOICE_LOGO_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 8 0 R /Length ${rgbBytes.length} >>\nstream\n`
      ),
      rgbBytes,
      stringToBytes('\nendstream\nendobj\n'),
    ])
  );

  // Object 8: Soft Mask (Alpha Transparency channel)
  objects.push(
    concatByteArrays([
      stringToBytes(
        `8 0 obj\n<< /Type /XObject /Subtype /Image /Width ${INVOICE_LOGO_WIDTH} /Height ${INVOICE_LOGO_HEIGHT} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${alphaBytes.length} >>\nstream\n`
      ),
      alphaBytes,
      stringToBytes('\nendstream\nendobj\n'),
    ])
  );

  // Assemble PDF with exact cross-reference table (xref)
  const header = stringToBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const offsets: number[] = [0]; // Object 0 is free
  let currentOffset = header.length;

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += obj.length;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return concatByteArrays([header, ...objects, stringToBytes(xref), stringToBytes(trailer)]);
}

/**
 * Initiates direct browser file download for the invoice PDF
 */
export function downloadInvoicePdf(order: OrderRow) {
  try {
    const pdfBytes = generateInvoicePdfBytes(order);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.order_number || '3DFormX'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (error) {
    console.error('[InvoicePdf] Failed to generate/download invoice PDF:', error);
  }
}

import { OrderRow } from '../types/database';

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

function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Builds a standard PDF 1.4 Tax Invoice document string
 */
export function generateInvoicePdfString(order: OrderRow): string {
  const stream: string[] = [];

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Top Dark Header Bar
  stream.push('0.06 0.08 0.12 rg');
  stream.push('0 755 595.28 86.89 re f');

  // Brand Orange Accent Stripe
  stream.push('0.96 0.43 0.12 rg');
  stream.push('0 751 595.28 4 re f');

  // Company Brand Name
  stream.push('BT');
  stream.push('/F2 22 Tf');
  stream.push('1 1 1 rg');
  stream.push('40 798 Td');
  stream.push(`(${escapePdf('3D FORMX')}) Tj`);
  stream.push('ET');

  // Tagline
  stream.push('BT');
  stream.push('/F2 8.5 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push('40 784 Td');
  stream.push(`(${escapePdf('PRECISION 3D PRINTING & ENGINEERING')}) Tj`);
  stream.push('ET');

  // GST & Support
  stream.push('BT');
  stream.push('/F1 8 Tf');
  stream.push('0.7 0.75 0.8 rg');
  stream.push('40 770 Td');
  stream.push(`(${escapePdf('GSTIN: 29AABCU9603R1ZX | support@3dformx.com')}) Tj`);
  stream.push('ET');

  // Right Title "TAX INVOICE"
  stream.push('BT');
  stream.push('/F2 18 Tf');
  stream.push('1 1 1 rg');
  stream.push('430 798 Td');
  stream.push(`(${escapePdf('TAX INVOICE')}) Tj`);
  stream.push('ET');

  // Invoice & Order metadata
  stream.push('BT');
  stream.push('/F1 8.5 Tf');
  stream.push('0.85 0.9 0.95 rg');
  stream.push('405 783 Td');
  stream.push(`(${escapePdf('Invoice No: INV-' + order.order_number)}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F1 8.5 Tf');
  stream.push('0.85 0.9 0.95 rg');
  stream.push('405 770 Td');
  stream.push(`(${escapePdf('Order Date: ' + orderDate)}) Tj`);
  stream.push('ET');

  // Address Section
  // Left: Seller Details
  stream.push('0.96 0.97 0.98 rg');
  stream.push('40 642 245 96 re f');
  stream.push('0.85 0.87 0.9 RG');
  stream.push('0.8 w');
  stream.push('40 642 245 96 re s');

  stream.push('BT');
  stream.push('/F2 8.5 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push('50 724 Td');
  stream.push(`(${escapePdf('SOLD BY / DISPATCHED FROM')}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F2 9.5 Tf');
  stream.push('0.1 0.1 0.1 rg');
  stream.push('50 709 Td');
  stream.push(`(${escapePdf('3D FormX Technologies Pvt Ltd')}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F1 8 Tf');
  stream.push('0.3 0.35 0.4 rg');
  stream.push('50 695 Td');
  stream.push(`(${escapePdf('Plot 42, Additive Prototyping Hub')}) Tj`);
  stream.push('50 683 Td');
  stream.push(`(${escapePdf('Peenya Industrial Area, Phase II')}) Tj`);
  stream.push('50 671 Td');
  stream.push(`(${escapePdf('Bengaluru, Karnataka - 560058')}) Tj`);
  stream.push('50 657 Td');
  stream.push(`(${escapePdf('Website: https://3dformx.com')}) Tj`);
  stream.push('ET');

  // Right: Customer Details
  stream.push('0.96 0.97 0.98 rg');
  stream.push('310 642 245 96 re f');
  stream.push('0.85 0.87 0.9 RG');
  stream.push('0.8 w');
  stream.push('310 642 245 96 re s');

  stream.push('BT');
  stream.push('/F2 8.5 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push('320 724 Td');
  stream.push(`(${escapePdf('BILLED TO / SHIP TO')}) Tj`);
  stream.push('ET');

  const customerName = order.address?.recipient_name || 'Valued Customer';
  stream.push('BT');
  stream.push('/F2 9.5 Tf');
  stream.push('0.1 0.1 0.1 rg');
  stream.push('320 709 Td');
  stream.push(`(${escapePdf(customerName)}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F1 8 Tf');
  stream.push('0.3 0.35 0.4 rg');
  let custY = 695;
  if (order.address?.address_line1) {
    stream.push(`320 ${custY} Td`);
    stream.push(`(${escapePdf(order.address.address_line1)}) Tj`);
    custY -= 12;
  }
  if (order.address?.address_line2) {
    stream.push(`320 ${custY} Td`);
    stream.push(`(${escapePdf(order.address.address_line2)}) Tj`);
    custY -= 12;
  }
  if (order.address?.landmark) {
    stream.push(`320 ${custY} Td`);
    stream.push(`(${escapePdf('Landmark: ' + order.address.landmark)}) Tj`);
    custY -= 12;
  }
  if (order.address?.city || order.address?.state) {
    const loc = `${order.address.city || ''}, ${order.address.state || ''} - ${order.address.postal_code || ''}`;
    stream.push(`320 ${custY} Td`);
    stream.push(`(${escapePdf(loc)}) Tj`);
    custY -= 12;
  }
  if (order.address?.phone) {
    stream.push(`320 ${custY} Td`);
    stream.push(`(${escapePdf('Phone: ' + order.address.phone)}) Tj`);
  }
  stream.push('ET');

  // Items Table Header
  stream.push('0.08 0.11 0.16 rg');
  stream.push('40 612 515 22 re f');

  stream.push('BT');
  stream.push('/F2 8.5 Tf');
  stream.push('1 1 1 rg');
  stream.push('50 619 Td');
  stream.push(`(${escapePdf('#')}) Tj`);
  stream.push('75 619 Td');
  stream.push(`(${escapePdf('ITEM DESCRIPTION')}) Tj`);
  stream.push('345 619 Td');
  stream.push(`(${escapePdf('QTY')}) Tj`);
  stream.push('400 619 Td');
  stream.push(`(${escapePdf('UNIT PRICE')}) Tj`);
  stream.push('480 619 Td');
  stream.push(`(${escapePdf('TOTAL AMOUNT')}) Tj`);
  stream.push('ET');

  // Items Table Rows
  const items = order.order_items || [];
  let itemY = 590;

  if (items.length === 0) {
    stream.push('BT');
    stream.push('/F1 8.5 Tf');
    stream.push('0.4 0.45 0.5 rg');
    stream.push(`50 ${itemY} Td`);
    stream.push(`(${escapePdf('Order items recorded with order reference #' + order.order_number)}) Tj`);
    stream.push('ET');
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
      stream.push('BT');
      stream.push('/F1 8.5 Tf');
      stream.push('0.3 0.35 0.4 rg');
      stream.push(`50 ${itemY} Td`);
      stream.push(`(${escapePdf(String(index + 1))}) Tj`);
      stream.push('ET');

      // Product Name
      stream.push('BT');
      stream.push('/F2 8.5 Tf');
      stream.push('0.1 0.1 0.1 rg');
      stream.push(`75 ${itemY} Td`);
      const rawName = item.product_name || 'Custom 3D Print Item';
      const truncated = rawName.length > 44 ? rawName.slice(0, 41) + '...' : rawName;
      stream.push(`(${escapePdf(truncated)}) Tj`);
      stream.push('ET');

      // Quantity
      stream.push('BT');
      stream.push('/F1 8.5 Tf');
      stream.push('0.2 0.25 0.3 rg');
      stream.push(`353 ${itemY} Td`);
      stream.push(`(${escapePdf(String(item.quantity))}) Tj`);
      stream.push('ET');

      // Unit Price
      stream.push('BT');
      stream.push('/F1 8.5 Tf');
      stream.push('0.2 0.25 0.3 rg');
      stream.push(`400 ${itemY} Td`);
      stream.push(`(${escapePdf('Rs. ' + Number(item.unit_price).toFixed(2))}) Tj`);
      stream.push('ET');

      // Line Total
      stream.push('BT');
      stream.push('/F2 8.5 Tf');
      stream.push('0.1 0.1 0.1 rg');
      stream.push(`480 ${itemY} Td`);
      stream.push(`(${escapePdf('Rs. ' + Number(item.line_total).toFixed(2))}) Tj`);
      stream.push('ET');

      itemY -= 22;
    });
  }

  // Totals Section
  const totalsY = Math.min(itemY - 15, 490);

  // Left Status Box
  stream.push('0.96 0.97 0.98 rg');
  stream.push(`40 ${totalsY - 72} 245 76 re f`);
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push(`40 ${totalsY - 72} 245 76 re s`);

  stream.push('BT');
  stream.push('/F2 8 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push(`50 ${totalsY - 14} Td`);
  stream.push(`(${escapePdf('PAYMENT & FULFILMENT')}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F1 8 Tf');
  stream.push('0.3 0.35 0.4 rg');
  stream.push(`50 ${totalsY - 28} Td`);
  stream.push(`(${escapePdf('Payment Method: Prepaid Online / UPI / Card')}) Tj`);
  stream.push(`50 ${totalsY - 41} Td`);
  stream.push(`(${escapePdf('Payment Status: ' + (order.payment_status || 'PAID').toUpperCase())}) Tj`);
  stream.push(`50 ${totalsY - 54} Td`);
  stream.push(`(${escapePdf('Order Status: ' + (order.status || 'PROCESSING').toUpperCase())}) Tj`);
  stream.push(`50 ${totalsY - 67} Td`);
  stream.push(`(${escapePdf('Standard B2C / B2B Tax invoice')}) Tj`);
  stream.push('ET');

  // Right Totals Box
  stream.push('0.97 0.98 0.99 rg');
  stream.push(`310 ${totalsY - 72} 245 76 re f`);
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push(`310 ${totalsY - 72} 245 76 re s`);

  const subtotal = Number(order.subtotal || order.total_amount);
  const shipping = Number(order.shipping_fee || 0);
  const total = Number(order.total_amount);

  // Subtotal
  stream.push('BT');
  stream.push('/F1 8.5 Tf');
  stream.push('0.3 0.35 0.4 rg');
  stream.push(`325 ${totalsY - 18} Td`);
  stream.push(`(${escapePdf('Items Subtotal:')}) Tj`);
  stream.push(`470 ${totalsY - 18} Td`);
  stream.push(`(${escapePdf('Rs. ' + subtotal.toFixed(2))}) Tj`);
  stream.push('ET');

  // Shipping
  stream.push('BT');
  stream.push('/F1 8.5 Tf');
  stream.push('0.3 0.35 0.4 rg');
  stream.push(`325 ${totalsY - 33} Td`);
  stream.push(`(${escapePdf('Shipping Charges:')}) Tj`);
  stream.push(`470 ${totalsY - 33} Td`);
  stream.push(`(${escapePdf(shipping === 0 ? 'FREE' : 'Rs. ' + shipping.toFixed(2))}) Tj`);
  stream.push('ET');

  // Total Accent Line
  stream.push('0.96 0.43 0.12 RG');
  stream.push('1 w');
  stream.push(`320 ${totalsY - 43} m 545 ${totalsY - 43} l s`);

  // Total Paid
  stream.push('BT');
  stream.push('/F2 10 Tf');
  stream.push('0.06 0.08 0.12 rg');
  stream.push(`325 ${totalsY - 60} Td`);
  stream.push(`(${escapePdf('Total Paid:')}) Tj`);
  stream.push('/F2 10.5 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push(`460 ${totalsY - 60} Td`);
  stream.push(`(${escapePdf('Rs. ' + total.toFixed(2))}) Tj`);
  stream.push('ET');

  // Footer Disclaimer & Brand info
  stream.push('0.85 0.88 0.9 RG');
  stream.push('0.5 w');
  stream.push('40 75 m 555 75 l s');

  stream.push('BT');
  stream.push('/F1 7.5 Tf');
  stream.push('0.4 0.45 0.5 rg');
  stream.push('40 60 Td');
  stream.push(`(${escapePdf('Note: This is an authentic, computer-generated tax invoice and requires no physical signature.')}) Tj`);
  stream.push('40 48 Td');
  stream.push(`(${escapePdf('For inquiries, warranty support, or custom model assistance, contact support@3dformx.com.')}) Tj`);
  stream.push('ET');

  stream.push('BT');
  stream.push('/F2 8 Tf');
  stream.push('0.96 0.43 0.12 rg');
  stream.push('40 34 Td');
  stream.push(`(${escapePdf('3D FormX Technologies | Precision Additive Manufacturing | www.3dformx.com')}) Tj`);
  stream.push('ET');

  const contentStream = stream.join('\n');
  const streamLength = getByteLength(contentStream);

  // PDF Objects
  const objects: string[] = [];

  // Object 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Object 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');

  // Object 3: Page
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj'
  );

  // Object 4: Contents Stream
  objects.push(
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`
  );

  // Object 5: Helvetica Normal
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj'
  );

  // Object 6: Helvetica Bold
  objects.push(
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  );

  let output = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(getByteLength(output));
    output += objects[i] + '\n';
  }

  const startXref = getByteLength(output);
  output += `xref\n0 ${objects.length + 1}\n`;
  output += '0000000000 65535 f \n';

  for (const offset of offsets) {
    const padded = String(offset).padStart(10, '0');
    output += `${padded} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return output;
}

/**
 * Triggers an instant download of the PDF invoice in the user's browser
 */
export function downloadInvoicePdf(order: OrderRow) {
  try {
    const pdfData = generateInvoicePdfString(order);
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3DFormX-Invoice-${order.order_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  } catch (error) {
    console.error('Error generating or downloading invoice PDF:', error);
    alert('Unable to generate invoice at this moment. Please try again.');
  }
}

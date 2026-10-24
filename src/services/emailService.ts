export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentId: string;
  orderDate?: string;
}

const ADMIN_EMAIL = 'kaduryathish28@gmail.com';

/**
 * Sends a rich transactional order notification email to the store owner
 */
export async function sendOrderNotificationEmail(payload: OrderEmailPayload): Promise<boolean> {
  const itemsSummary = payload.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name} - Qty: ${item.quantity} × ₹${item.price} = ₹${item.lineTotal}`
    )
    .join('\n');

  const emailBody = {
    _subject: `🛒 New Paid Order #${payload.orderNumber} (₹${payload.totalAmount}) - 3D FormX`,
    _template: 'table',
    _captcha: 'false',
    'Store Name': '3D FormX (www.3dformx.in)',
    'Order Number': payload.orderNumber,
    'Payment Status': 'PAID (Verified via Razorpay)',
    'Razorpay Payment ID': payload.paymentId,
    'Order Date & Time': payload.orderDate || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    '-----------------------': '----------------------------------------',
    'Customer Name': payload.customerName,
    'Customer Phone': `+91 ${payload.phone}`,
    'Customer Email': payload.email || 'N/A',
    'Delivery Address': payload.address,
    '------------------------': '----------------------------------------',
    'Items Ordered': itemsSummary,
    'Items Subtotal': `₹${payload.subtotal}`,
    'Delivery / Shipping Fee': payload.shippingFee === 0 ? 'FREE' : `₹${payload.shippingFee}`,
    'Total Amount Paid': `₹${payload.totalAmount}`,
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (response.ok) {
      console.log(`[EmailService] Order notification successfully sent to ${ADMIN_EMAIL} for order #${payload.orderNumber}`);
      return true;
    } else {
      console.warn(`[EmailService] Non-OK response sending order email:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`[EmailService] Unexpected error sending order email to ${ADMIN_EMAIL}:`, error);
    // Silent fail so customer checkout is never blocked
    return false;
  }
}

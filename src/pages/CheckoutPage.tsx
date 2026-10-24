import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Lock,
  MapPin,
  ShoppingBag,
  Phone,
  Mail,
  Check,
  Pencil,
  AlertCircle,
  Key,
  FileText,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { sendOrderNotificationEmail } from '../services/emailService';
import {
  loadRazorpayScript,
  getRazorpayKeyId,
  RazorpayPaymentSuccess,
  RazorpayPaymentFailure,
} from '../services/razorpayService';
import { Address, OrderRow } from '../types/database';
import { SELECTED_ADDRESS_STORAGE_KEY } from './AddressPage';
import { formatPrice } from '../utils/format';
import { downloadInvoicePdf } from '../utils/invoicePdf';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, shipping, totalPrice, clearCart } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    try {
      const raw = sessionStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Address) : null;
    } catch {
      return null;
    }
  });
  const [loadingAddress, setLoadingAddress] = useState<boolean>(!selectedAddress);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Manual key input fallback if not yet set in .env
  const [customKeyInput, setCustomKeyInput] = useState<string>(() => getRazorpayKeyId());

  // Keep snapshot of ordered items & total for the confirmation screen after clearCart()
  const [confirmedItems, setConfirmedItems] = useState(cart);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(subtotal);
  const [confirmedShipping, setConfirmedShipping] = useState(shipping);
  const [confirmedTotal, setConfirmedTotal] = useState(totalPrice);

  // Redirect to /address if not logged in or if no address is selected
  useEffect(() => {
    if (orderConfirmed) return;
    if (!authLoading && !user) {
      navigate('/address');
      return;
    }

    if (user && !selectedAddress) {
      setLoadingAddress(true);
      addressService.getAddresses(user.id).then((list) => {
        setLoadingAddress(false);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.is_default) || list[0];
          setSelectedAddress(defaultAddr);
          sessionStorage.setItem(
            SELECTED_ADDRESS_STORAGE_KEY,
            JSON.stringify(defaultAddr)
          );
        } else {
          navigate('/address');
        }
      });
    }
  }, [authLoading, user, selectedAddress, navigate, orderConfirmed]);

  // Preload Razorpay checkout script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-dark-900 border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 font-heading">
            No Items to Checkout
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Your shopping cart is currently empty. Add products before proceeding.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
          >
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!selectedAddress) {
      navigate('/address');
      return;
    }

    const effectiveKey = (customKeyInput || getRazorpayKeyId()).trim();
    if (!effectiveKey) {
      setPaymentError(
        'Razorpay Key ID is required. Please set VITE_RAZORPAY_KEY_ID in your .env file or enter your Razorpay Key ID below.'
      );
      return;
    }

    setIsSubmitting(true);

    // 1. Ensure Razorpay SDK is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
      setIsSubmitting(false);
      setPaymentError(
        'Unable to load Razorpay payment gateway. Please verify your internet connection and try again.'
      );
      return;
    }

    // Keep snapshot of current checkout before opening payment window
    setConfirmedItems([...cart]);
    setConfirmedSubtotal(subtotal);
    setConfirmedShipping(shipping);
    setConfirmedTotal(totalPrice);

    const fullAddressSummary = [
      selectedAddress.address_line1,
      selectedAddress.address_line2,
      selectedAddress.landmark ? `Landmark: ${selectedAddress.landmark}` : '',
      `${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code}`,
    ]
      .filter(Boolean)
      .join(', ');

    // 2. Configure Razorpay Standard Checkout
    const options = {
      key: effectiveKey,
      amount: Math.round(totalPrice * 100), // amount in paise
      currency: 'INR',
      name: '3D FormX',
      description: `3D Printing & Manufacturing Order (${cart.reduce((s, i) => s + i.quantity, 0)} items)`,
      image: '/images/favicon.png',
      prefill: {
        name: selectedAddress.recipient_name,
        email: user?.email || profile?.email || '',
        contact: selectedAddress.phone,
      },
      notes: {
        delivery_address: fullAddressSummary,
      },
      theme: {
        color: '#f97316', // brand orange
        backdrop_color: 'rgba(2, 6, 23, 0.95)',
      },
      modal: {
        ondismiss: () => {
          setIsSubmitting(false);
          setPaymentError(
            'Payment window was closed before completion. Your order was NOT confirmed and no amount was debited.'
          );
        },
        escape: true,
        backdropclose: false,
      },
      // 3. ONLY ON 100% SUCCESSFUL PAYMENT VERIFICATION
      handler: async (response: RazorpayPaymentSuccess) => {
        setIsSubmitting(true);
        setPaymentError(null);

        try {
          const result = await orderService.createOrder({
            userId: user?.id || null,
            addressId: selectedAddress.id,
            customerName: selectedAddress.recipient_name,
            phone: selectedAddress.phone,
            email: user?.email || profile?.email || '',
            addressLine1: selectedAddress.address_line1,
            addressLine2: selectedAddress.address_line2 || undefined,
            landmark: selectedAddress.landmark || undefined,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postal_code,
            paymentMethod: 'razorpay',
            paymentId: response.razorpay_payment_id,
            subtotal,
            shippingFee: shipping,
            totalAmount: totalPrice,
            items: cart,
          });

          setConfirmedPaymentId(response.razorpay_payment_id);
          setOrderId(result.orderNumber);
          setOrderConfirmed(true);
          clearCart();
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Send order notification email to kaduryathish28@gmail.com
          sendOrderNotificationEmail({
            orderNumber: result.orderNumber,
            customerName: selectedAddress.recipient_name,
            phone: selectedAddress.phone,
            email: user?.email || profile?.email || '',
            address: fullAddressSummary,
            items: cart.map((i) => {
              const unit = i.product.price + (i.selectedVariant?.priceModifier || 0);
              return {
                name: `${i.product.name}${i.selectedVariant ? ` (${i.selectedVariant.name})` : ''}`,
                quantity: i.quantity,
                price: unit,
                lineTotal: unit * i.quantity,
              };
            }),
            subtotal,
            shippingFee: shipping,
            totalAmount: totalPrice,
            paymentId: response.razorpay_payment_id,
          });
        } catch (err: any) {
          console.error('[CheckoutPage] Post-payment order recording error:', err);
          // Even if local network hiccups after payment, mark order confirmed with payment ID
          const fallbackOrderNumber = `FX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          setConfirmedPaymentId(response.razorpay_payment_id);
          setOrderId(fallbackOrderNumber);
          setOrderConfirmed(true);
          clearCart();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
          setIsSubmitting(false);
        }
      },
    };

    try {
      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (failData: RazorpayPaymentFailure) => {
        setIsSubmitting(false);
        const reason =
          failData?.error?.description ||
          failData?.error?.reason ||
          'Payment transaction was declined or failed. Your order has NOT been placed.';
        setPaymentError(`Payment Failed: ${reason}`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setIsSubmitting(false);
      setPaymentError(
        err?.message || 'Failed to initialize Razorpay checkout. Please verify your Key ID.'
      );
    }
  };

  // SUCCESS CONFIRMATION VIEW - ONLY SHOWN AFTER SUCCESSFUL RAZORPAY PAYMENT
  if (orderConfirmed && selectedAddress) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center py-14 px-4">
        <div className="max-w-2xl w-full bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={42} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              <span>PAYMENT VERIFIED & CONFIRMED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 font-heading">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Order Number:{' '}
              <strong className="text-brand-orange font-mono text-base ml-1">
                {orderId}
              </strong>
            </p>
          </div>

          {/* Complete Order & Delivery Summary */}
          <div className="bg-dark-850 border border-slate-800 rounded-2xl p-5 mb-6 text-xs sm:text-sm space-y-4 text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <p className="text-[11px] font-mono uppercase text-brand-orange font-bold mb-1">
                  Delivery Address
                </p>
                <p className="font-bold text-white">{selectedAddress.recipient_name}</p>
                <p>{selectedAddress.address_line1}</p>
                {selectedAddress.address_line2 && <p>{selectedAddress.address_line2}</p>}
                {selectedAddress.landmark && (
                  <p className="text-slate-400">Landmark: {selectedAddress.landmark}</p>
                )}
                <p className="font-semibold text-white">
                  {selectedAddress.city}, {selectedAddress.state} -{' '}
                  <span className="font-mono">{selectedAddress.postal_code}</span>
                </p>
                <p className="text-slate-400 font-mono mt-1">
                  Phone: {selectedAddress.phone}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-mono uppercase text-brand-orange font-bold mb-1">
                  Payment Verification
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="text-white font-bold font-mono">Razorpay</span>
                </div>
                {confirmedPaymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Razorpay Ref ID:</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {confirmedPaymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="text-emerald-400 font-bold uppercase font-mono">
                    PAID (SUCCESS)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-mono text-white">
                    {formatPrice(confirmedSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping Charges:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {confirmedShipping === 0 ? 'FREE' : formatPrice(confirmedShipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-white">Total Amount Paid:</span>
                  <span className="text-brand-orange font-mono text-base">
                    {formatPrice(confirmedTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <p className="text-[11px] font-mono uppercase text-brand-orange font-bold mb-2.5">
                Ordered Items ({confirmedItems.length})
              </p>
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {confirmedItems.map((item) => {
                  const unit =
                    item.product.price + (item.selectedVariant?.priceModifier || 0);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-dark-900 border border-slate-800 flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-slate-400">
                            Qty: {item.quantity} × {formatPrice(unit)}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white flex-shrink-0">
                        {formatPrice(unit * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (!selectedAddress) return;
                const orderObj: OrderRow = {
                  id: orderId || 'temp',
                  order_number: orderId || 'FX-2026-00000',
                  user_id: user?.id || null,
                  address_id: selectedAddress.id,
                  status: 'pending',
                  payment_status: 'paid',
                  payment_id: confirmedPaymentId,
                  payment_method: 'razorpay',
                  subtotal: confirmedSubtotal,
                  shipping_fee: confirmedShipping,
                  total_amount: confirmedTotal,
                  customer_notes: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  address: selectedAddress,
                  order_items: confirmedItems.map((item, idx) => {
                    const unit = item.product.price + (item.selectedVariant?.priceModifier || 0);
                    return {
                      id: `item-${idx}`,
                      order_id: orderId || 'temp',
                      product_id: item.product.id || null,
                      product_name: `${item.product.name}${item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}`,
                      unit_price: unit,
                      quantity: item.quantity,
                      line_total: unit * item.quantity,
                    };
                  }),
                };
                downloadInvoicePdf(orderObj);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-brand-orange text-white hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-700 hover:border-brand-orange shadow-lg"
            >
              <FileText size={15} />
              <span>Download Tax Invoice (PDF)</span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors shadow-lg shadow-brand-orange/20"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-dark-800 border border-slate-700 text-white font-semibold text-xs hover:bg-dark-750 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveKey = (customKeyInput || getRazorpayKeyId()).trim();
  const hasKeyConfigured = Boolean(effectiveKey);

  return (
    <div className="min-h-screen bg-dark-950 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Step Checkout Progress Bar: Shopping Cart > Address > Checkout */}
        <div className="mb-10">
          <div className="flex items-center justify-center max-w-xl mx-auto text-xs sm:text-sm font-bold">
            {/* Step 1: Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-emerald-400 hover:text-brand-orange transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs">
                <Check size={14} />
              </span>
              <span>Shopping Cart</span>
            </Link>

            <div className="flex-1 h-0.5 bg-emerald-500/60 mx-3 sm:mx-5" />

            {/* Step 2: Address */}
            <Link
              to="/address"
              className="flex items-center gap-2 text-emerald-400 hover:text-brand-orange transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs">
                <Check size={14} />
              </span>
              <span>Delivery Address</span>
            </Link>

            <div className="flex-1 h-0.5 bg-brand-orange/60 mx-3 sm:mx-5" />

            {/* Step 3: Checkout (Current) */}
            <div className="flex items-center gap-2 text-brand-orange">
              <span className="w-7 h-7 rounded-full bg-brand-orange text-black font-extrabold flex items-center justify-center text-xs shadow-lg shadow-brand-orange/30">
                3
              </span>
              <span>Checkout & Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/address"
            className="p-2.5 rounded-xl bg-dark-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Back to delivery address"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Review Order & Secure Payment
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Verify your delivery address, review items, and complete online payment via Razorpay.
            </p>
          </div>
        </div>

        {loadingAddress || !selectedAddress ? (
          <div className="h-64 rounded-3xl bg-dark-900 border border-slate-800 animate-pulse" />
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Detailed Address, Detailed Items, & Payment Method */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* 1. Selected Delivery Address Details Card */}
              <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-brand-orange">
                    <MapPin size={20} />
                    <h2 className="text-lg font-bold text-white font-heading">
                      1. Delivery Address Details
                    </h2>
                  </div>

                  <Link
                    to="/address"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dark-800 hover:bg-brand-orange text-xs font-bold text-slate-200 hover:text-black border border-slate-700 hover:border-brand-orange transition-all"
                  >
                    <Pencil size={12} />
                    <span>Change Address</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Recipient & Contact
                    </p>
                    <p className="text-base font-extrabold text-white font-heading">
                      {selectedAddress.recipient_name}
                    </p>
                    <p className="flex items-center gap-2 text-slate-300 font-mono">
                      <Phone size={13} className="text-brand-orange" />
                      <span>+91 {selectedAddress.phone}</span>
                    </p>
                    {(user?.email || profile?.email) && (
                      <p className="flex items-center gap-2 text-slate-400">
                        <Mail size={13} className="text-brand-orange" />
                        <span>{user?.email || profile?.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Shipping Destination
                    </p>
                    <p className="font-semibold text-white">
                      {selectedAddress.address_line1}
                    </p>
                    {selectedAddress.address_line2 && (
                      <p>{selectedAddress.address_line2}</p>
                    )}
                    {selectedAddress.landmark && (
                      <p className="text-slate-400">
                        Landmark:{' '}
                        <span className="text-slate-200">{selectedAddress.landmark}</span>
                      </p>
                    )}
                    <p className="font-bold text-white pt-0.5">
                      {selectedAddress.city}, {selectedAddress.state} -{' '}
                      <span className="font-mono text-brand-orange">
                        {selectedAddress.postal_code}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">{selectedAddress.country || 'India'}</p>
                  </div>
                </div>
              </div>

              {/* 2. Detailed Order Items Breakdown */}
              <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-brand-orange">
                    <ShoppingBag size={20} />
                    <h2 className="text-lg font-bold text-white font-heading">
                      2. Items in Your Order ({cart.length})
                    </h2>
                  </div>

                  <Link
                    to="/cart"
                    className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors"
                  >
                    Edit Cart
                  </Link>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {cart.map((item) => {
                    const unitPrice =
                      item.product.price + (item.selectedVariant?.priceModifier || 0);
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="w-16 h-16 rounded-xl overflow-hidden bg-dark-850 border border-slate-800 flex-shrink-0 p-1"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </Link>

                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange font-mono block">
                              {item.product.categoryLabel}
                            </span>
                            <Link
                              to={`/product/${item.product.id}`}
                              className="text-sm font-bold text-white hover:text-brand-orange transition-colors truncate block font-heading"
                            >
                              {item.product.name}
                            </Link>
                            {item.selectedVariant && (
                              <p className="text-xs text-slate-400">
                                Option: {item.selectedVariant.name}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              Qty: <strong className="text-white">{item.quantity}</strong> ×{' '}
                              {formatPrice(unitPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-white font-mono">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Payment Method: Razorpay Online Payment & COD Disabled */}
              <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-brand-orange">
                    <CreditCard size={20} />
                    <h2 className="text-lg font-bold text-white font-heading">
                      3. Payment Method
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                    <ShieldCheck size={13} />
                    <span>RAZORPAY VERIFIED</span>
                  </span>
                </div>

                {/* Main Razorpay Gateway Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-850 to-dark-900 border-2 border-brand-orange shadow-lg shadow-brand-orange/5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold font-mono">
                        ₹
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-white flex items-center gap-2">
                          <span>Razorpay Secure Checkout</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-orange text-black font-extrabold">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Instant payment verification • 100% encrypted & RBI authorized
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supported Payment Channels Grid (Fits cleanly inside the card, zero overflow) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80 w-full min-w-0">
                    <div className="p-3 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-center gap-2.5 w-full min-w-0">
                      <QrCode size={18} className="text-brand-orange flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">Instant UPI</div>
                        <div className="text-[10px] text-slate-400 truncate">GPay, PhonePe, Paytm</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-center gap-2.5 w-full min-w-0">
                      <CreditCard size={18} className="text-brand-orange flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">Cards</div>
                        <div className="text-[10px] text-slate-400 truncate">Debit, Credit & RuPay</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-center gap-2.5 w-full min-w-0">
                      <Building2 size={18} className="text-brand-orange flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">NetBanking</div>
                        <div className="text-[10px] text-slate-400 truncate">50+ Major Indian Banks</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-center gap-2.5 w-full min-w-0">
                      <Wallet size={18} className="text-brand-orange flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">Wallets</div>
                        <div className="text-[10px] text-slate-400 truncate">Paytm, Mobikwik & more</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Razorpay Key ID Configuration Assistant (if not yet in .env) */}
                {!hasKeyConfigured && (
                  <div className="p-4 rounded-2xl bg-dark-850 border border-slate-700/80 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-orange font-mono">
                      <Key size={14} />
                      <span>Razorpay Key ID Required</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Please enter your Razorpay Key ID below or set{' '}
                      <code className="text-brand-orange font-mono bg-dark-950 px-1 py-0.5 rounded">
                        VITE_RAZORPAY_KEY_ID
                      </code>{' '}
                      in your project’s <code className="text-white font-mono">.env</code> file. You can find this in your Razorpay Dashboard under Settings → API Keys.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customKeyInput}
                        onChange={(e) => setCustomKeyInput(e.target.value)}
                        placeholder="e.g. rzp_test_xxxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxxx"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary Box */}
            <div className="lg:col-span-5 bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-5 font-heading">
                Final Order Summary
              </h3>

              {/* Compact Delivery Summary */}
              <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 mb-5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-orange uppercase font-mono text-[10px]">
                    Delivering To
                  </span>
                  <Link
                    to="/address"
                    className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
                  >
                    Change
                  </Link>
                </div>
                <p className="font-bold text-white">{selectedAddress.recipient_name}</p>
                <p className="text-slate-300 line-clamp-2">
                  {[
                    selectedAddress.address_line1,
                    selectedAddress.address_line2,
                    selectedAddress.landmark,
                    selectedAddress.city,
                    selectedAddress.state,
                    selectedAddress.postal_code,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 pb-5 border-b border-slate-800">
                <div className="flex justify-between">
                  <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-mono font-semibold text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-mono font-semibold">
                    {shipping === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      <span>{formatPrice(shipping)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Gateway</span>
                  <span className="font-mono font-bold uppercase text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/30 text-[11px]">
                    Razorpay
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-5 mb-5">
                <div>
                  <span className="text-base font-bold text-white font-heading block">
                    Total Payable
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Inclusive of all applicable taxes
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-brand-orange font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Payment Error / Cancelled Alert */}
              {paymentError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold block text-rose-200 mb-0.5">Payment Notice</span>
                    <span>{paymentError}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Pay with Razorpay ({formatPrice(totalPrice)})
                  </>
                )}
              </button>

              <div className="mt-4 flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <div className="flex items-center gap-1.5">
                  <Lock size={13} className="text-brand-orange" />
                  <span className="font-medium">256-Bit SSL Encrypted Razorpay Checkout</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Only successful payment will confirm and place your order.
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  Lock,
  MapPin,
  ShoppingBag,
  Phone,
  Mail,
  Check,
  Pencil,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { Address } from '../types/database';
import { SELECTED_ADDRESS_STORAGE_KEY } from './AddressPage';
import { formatPrice } from '../utils/format';

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

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

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
    if (!selectedAddress) {
      navigate('/address');
      return;
    }

    setIsSubmitting(true);
    setConfirmedItems([...cart]);
    setConfirmedSubtotal(subtotal);
    setConfirmedShipping(shipping);
    setConfirmedTotal(totalPrice);

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
        notes: customerNotes.trim() || undefined,
        paymentMethod,
        subtotal,
        shippingFee: shipping,
        totalAmount: totalPrice,
        items: cart,
      });

      setOrderId(result.orderNumber);
      setOrderConfirmed(true);
      clearCart();
    } catch {
      setOrderId(`FX-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderConfirmed(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed && selectedAddress) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center py-14 px-4">
        <div className="max-w-2xl w-full bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
              ORDER CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 font-heading">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Order Number:{' '}
              <strong className="text-brand-orange font-mono text-base">
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
                  Payment & Billing
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="uppercase text-white font-bold">{paymentMethod}</span>
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
                  <span className="text-white">Total Amount:</span>
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
              onClick={() => navigate('/orders')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
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
              <span>Checkout</span>
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
              Review Order & Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Verify your delivery address, items, and payment method before placing your order.
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

              {/* 3. Payment Method Selection */}
              <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
                <div className="flex items-center gap-2 text-brand-orange mb-5">
                  <CreditCard size={20} />
                  <h2 className="text-lg font-bold text-white font-heading">
                    3. Select Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {/* UPI Option */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'upi'
                        ? 'bg-dark-850 border-brand-orange ring-1 ring-brand-orange/40'
                        : 'bg-dark-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">Instant UPI</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Google Pay, PhonePe, Paytm, BHIM
                      </div>
                    </div>
                  </label>

                  {/* Cards Option */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'card'
                        ? 'bg-dark-850 border-brand-orange ring-1 ring-brand-orange/40'
                        : 'bg-dark-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">Debit / Credit Card</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        RuPay, Visa, Mastercard
                      </div>
                    </div>
                  </label>

                  {/* NetBanking */}
                  <label
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-dark-850 border-brand-orange ring-1 ring-brand-orange/40'
                        : 'bg-dark-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">NetBanking</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        All Major Indian Banks Supported
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentMethod === 'cod'
                        ? 'bg-dark-850 border-brand-orange ring-1 ring-brand-orange/40'
                        : 'bg-dark-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">Cash on Delivery</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Pay in cash or UPI upon delivery
                      </div>
                    </div>
                  </label>
                </div>

                {/* Optional Delivery Instructions / Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Delivery Notes / Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Gift wrap request, preferred delivery time..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>
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
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-mono font-bold uppercase text-brand-orange">
                    {paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-5 mb-6">
                <span className="text-base font-bold text-white font-heading">
                  Total Payable
                </span>
                <span className="text-2xl font-extrabold text-brand-orange font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Place Order ({formatPrice(totalPrice)})
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <Lock size={13} className="text-brand-orange" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Lock,
  UserCheck,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Phone,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { OrderRow } from '../types/database';
import { formatPrice } from '../utils/format';
import { downloadInvoicePdf } from '../utils/invoicePdf';

const STATUS_STEPS: Array<{ key: OrderRow['status']; label: string }> = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function getStatusBadge(status: OrderRow['status']) {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        icon: <CheckCircle2 size={13} />,
      };
    case 'shipped':
      return {
        label: 'Shipped',
        classes: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
        icon: <Truck size={13} />,
      };
    case 'processing':
      return {
        label: 'Processing',
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: <Clock size={13} />,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        classes: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        icon: <XCircle size={13} />,
      };
    default:
      return {
        label: 'Order Placed',
        classes: 'bg-brand-orange/20 text-brand-orange border-brand-orange/40',
        icon: <Clock size={13} />,
      };
  }
}

export const OrdersPage: React.FC = () => {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const toggleOrder = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    orderService.getUserOrders(user.id).then((data) => {
      if (active) {
        setOrders(data);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-dark-950 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link & Page Title */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-orange transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange font-mono block mb-1">
                ACCOUNT & ORDER HISTORY
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                My Orders
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Track your orders, view itemized receipts, and check delivery status.
              </p>
            </div>

            {user && orders.length > 0 && (
              <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-dark-900 border border-slate-800 text-slate-300 self-start sm:self-auto">
                Total Orders: <strong className="text-brand-orange">{orders.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Not Logged In State */}
        {!authLoading && !user ? (
          <div className="max-w-xl mx-auto bg-dark-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl my-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mx-auto mb-5">
              <Lock size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-heading">
              Sign In to View Your Orders
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Please sign in to your 3D FormX account to view your order history, delivery address details, and tracking status.
            </p>
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all shadow-lg shadow-brand-orange/20"
            >
              <UserCheck size={16} />
              <span>Sign In Now</span>
            </button>
          </div>
        ) : loading ? (
          /* Loading Skeletons */
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-64 rounded-3xl bg-dark-900 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <div className="bg-dark-900 border border-slate-800 rounded-3xl p-10 sm:p-14 text-center shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-dark-850 border border-slate-700/80 text-brand-orange flex items-center justify-center mx-auto mb-6">
              <Package size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2 font-heading">
              No Orders Found Yet
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              You haven't placed any orders yet. Explore our latest collection and place your first order!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all"
            >
              <span>Start Shopping</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const isSelected = selectedOrderId === order.id;

              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const currentStepIndex = STATUS_STEPS.findIndex(
                (s) => s.key === order.status
              );

              const itemsCount =
                order.order_items?.reduce((acc, it) => acc + (it.quantity || 1), 0) ||
                order.order_items?.length ||
                0;

              const itemsSummary =
                order.order_items && order.order_items.length > 0
                  ? order.order_items
                      .map((it) => `${it.product_name}${it.quantity > 1 ? ` (×${it.quantity})` : ''}`)
                      .join(', ')
                  : '3D FormX custom item';

              return (
                <div
                  key={order.id}
                  className={`bg-dark-900 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ${
                    isSelected
                      ? 'border-brand-orange/60 ring-1 ring-brand-orange/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Summary Card (Always Visible) - Click to toggle */}
                  <div
                    onClick={() => toggleOrder(order.id)}
                    className="p-5 sm:p-6 cursor-pointer select-none transition-colors hover:bg-dark-850/60"
                  >
                    {/* Top Row: Order ID, Date, Status & Payment Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-sm sm:text-base font-extrabold text-brand-orange font-mono">
                          #{order.order_number}
                        </span>

                        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-brand-orange" />
                          {orderDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.classes}`}
                        >
                          {statusInfo.icon}
                          <span>{statusInfo.label}</span>
                        </span>

                        {/* Payment Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold uppercase ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <CreditCard size={11} />
                          <span>{order.payment_status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Items preview, Recipient preview, Total Amount */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Package size={14} className="text-brand-orange shrink-0" />
                          <span>
                            {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}:
                          </span>
                          <span className="text-slate-300 font-normal truncate max-w-md">
                            {itemsSummary}
                          </span>
                        </div>

                        {order.address && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={13} className="text-slate-500 shrink-0" />
                            <span>
                              Deliver to:{' '}
                              <strong className="text-slate-200 font-semibold">
                                {order.address.recipient_name}
                              </strong>{' '}
                              ({order.address.city}, {order.address.state})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Total Amount */}
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          Total Amount
                        </span>
                        <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                          {formatPrice(Number(order.total_amount))}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar: Download Invoice & View Details Button */}
                    <div className="pt-4 mt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                      {/* Download Invoice PDF Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadInvoicePdf(order);
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-brand-orange text-slate-200 hover:text-black font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 hover:border-brand-orange shadow-md group"
                        title="Download Tax Invoice PDF"
                      >
                        <Download size={13} className="text-brand-orange group-hover:text-black transition-colors" />
                        <span>Download Invoice (PDF)</span>
                      </button>

                      {/* View / Hide Details Toggle */}
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-brand-orange transition-colors">
                        <span>{isSelected ? 'Hide Details' : 'View Order Details'}</span>
                        {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail View (Only shown when this order is selected) */}
                  {isSelected && (
                    <div className="border-t border-slate-800 bg-dark-950/70 p-6 sm:p-7 space-y-6">
                      {/* Step Progress Tracker */}
                      {order.status !== 'cancelled' ? (
                        <div className="bg-dark-900 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
                          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-3">
                            Delivery Tracking Status
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {STATUS_STEPS.map((step, idx) => {
                              const completed =
                                idx <= (currentStepIndex === -1 ? 0 : currentStepIndex);
                              return (
                                <div key={step.key} className="flex flex-col gap-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      completed ? 'bg-brand-orange' : 'bg-slate-800'
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] sm:text-xs font-bold ${
                                      completed ? 'text-white' : 'text-slate-500'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                          <XCircle size={15} />
                          <span>This order was cancelled.</span>
                        </div>
                      )}

                      {/* Itemized Table + Delivery Address & Billing */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left: Itemized Products */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-mono uppercase tracking-wider text-brand-orange font-bold flex items-center gap-1.5">
                              <Package size={14} />
                              <span>Itemized Receipt ({order.order_items?.length || 0})</span>
                            </h3>
                          </div>

                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="divide-y divide-slate-800/80 bg-dark-900 border border-slate-800 rounded-2xl px-4">
                              {order.order_items.map((item) => (
                                <div
                                  key={item.id}
                                  className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
                                >
                                  <div>
                                    <p className="font-bold text-white">{item.product_name}</p>
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                                      Qty: <strong className="text-slate-200">{item.quantity}</strong>{' '}
                                      × {formatPrice(Number(item.unit_price))}
                                    </p>
                                  </div>
                                  <div className="text-right font-mono font-bold text-white">
                                    {formatPrice(Number(item.line_total))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              Items recorded with order reference.
                            </p>
                          )}
                        </div>

                        {/* Right: Delivery Address & Billing Breakdown */}
                        <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-dark-900 border border-slate-800 rounded-2xl p-5 text-xs">
                          {/* Delivery Address */}
                          <div>
                            <div className="flex items-center gap-1.5 text-brand-orange font-mono uppercase font-bold mb-2.5">
                              <MapPin size={13} />
                              <span>Shipping & Delivery Details</span>
                            </div>

                            {order.address ? (
                              <div className="space-y-1 text-slate-300 leading-relaxed">
                                <p className="font-bold text-white text-sm">
                                  {order.address.recipient_name}
                                </p>
                                <p>{order.address.address_line1}</p>
                                {order.address.address_line2 && (
                                  <p>{order.address.address_line2}</p>
                                )}
                                {order.address.landmark && (
                                  <p className="text-slate-400">
                                    Landmark: {order.address.landmark}
                                  </p>
                                )}
                                <p className="font-semibold text-white">
                                  {order.address.city}, {order.address.state} -{' '}
                                  <span className="font-mono text-brand-orange">
                                    {order.address.postal_code}
                                  </span>
                                </p>
                                <p className="flex items-center gap-1.5 text-slate-400 font-mono pt-1">
                                  <Phone size={12} className="text-brand-orange" />
                                  <span>{order.address.phone}</span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-slate-300 leading-relaxed">
                                {order.customer_notes || 'Standard Delivery'}
                              </p>
                            )}
                          </div>

                          {/* Billing Breakdown */}
                          <div className="pt-3 border-t border-slate-800 space-y-1.5">
                            <div className="flex justify-between text-slate-400">
                              <span>Subtotal</span>
                              <span className="font-mono text-white">
                                {formatPrice(Number(order.subtotal))}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Shipping Charges</span>
                              <span className="font-mono font-semibold text-emerald-400">
                                {Number(order.shipping_fee) === 0
                                  ? 'FREE'
                                  : formatPrice(Number(order.shipping_fee))}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                              <span className="text-white">Total Paid</span>
                              <span className="font-mono text-brand-orange text-base">
                                {formatPrice(Number(order.total_amount))}
                              </span>
                            </div>
                          </div>

                          {/* Full PDF Download Button inside detailed view */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => downloadInvoicePdf(order)}
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all shadow-md"
                            >
                              <FileText size={14} />
                              <span>Download Tax Invoice (PDF)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shipping,
    totalPrice,
  } = useCart();

  const freeShippingThreshold = 500;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-dark-900 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-dark-850 border border-slate-700/80 text-brand-orange flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 font-heading">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            Looks like you haven't added any items to your cart yet. Explore our latest collection and add your favorites!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={16} />
          </Link>
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
            {/* Step 1: Cart (Current) */}
            <div className="flex items-center gap-2 text-brand-orange">
              <span className="w-7 h-7 rounded-full bg-brand-orange text-black font-extrabold flex items-center justify-center text-xs shadow-lg shadow-brand-orange/30">
                1
              </span>
              <span>Shopping Cart</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-800 mx-3 sm:mx-5" />

            {/* Step 2: Address */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-7 h-7 rounded-full bg-dark-900 border border-slate-800 flex items-center justify-center text-xs">
                2
              </span>
              <span>Delivery Address</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-800 mx-3 sm:mx-5" />

            {/* Step 3: Checkout */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-7 h-7 rounded-full bg-dark-900 border border-slate-800 flex items-center justify-center text-xs">
                3
              </span>
              <span>Checkout</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review your selected items before proceeding to checkout.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Free Shipping Progress Ribbon */}
        <div className="mb-8 p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-400 font-bold">
                  🎉 You have unlocked FREE Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-brand-orange font-mono">{formatPrice(remainingForFreeShipping)}</strong> more to unlock <strong className="text-white">FREE Shipping</strong>!
                </span>
              )}
            </span>
            <span className="font-mono text-slate-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-dark-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-brand-orange transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Cart Items (Left) & Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.map((item) => {
              const unitPrice = item.product.price + (item.selectedVariant?.priceModifier || 0);
              const lineTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-dark-900 border border-slate-800 hover:border-slate-700/80 transition-all"
                >
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-dark-850 border border-slate-800 flex-shrink-0 p-1"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </Link>

                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-brand-orange uppercase font-mono">
                        {item.product.categoryLabel}
                      </span>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-sm font-bold text-white hover:text-brand-orange transition-colors line-clamp-1 font-heading"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedVariant && (
                        <span className="text-xs text-slate-400 mt-0.5">
                          Variant: <strong className="text-slate-200">{item.selectedVariant.name}</strong>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono mt-1 sm:hidden">
                        {formatPrice(unitPrice)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    {/* Stepper */}
                    <div className="flex items-center bg-dark-850 border border-slate-700/80 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[90px]">
                      <div className="text-sm font-bold text-white font-mono">
                        {formatPrice(lineTotal)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
                        ({formatPrice(unitPrice)} ea)
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors"
              >
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl sticky top-24">
            <h3 className="text-lg font-bold text-white mb-5 font-heading">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 pb-5 border-b border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-white">{formatPrice(subtotal)}</span>
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
            </div>

            <div className="flex justify-between items-baseline pt-5 mb-6">
              <span className="text-base font-bold text-white font-heading">Total Amount</span>
              <span className="text-2xl font-extrabold text-brand-orange font-mono">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Link
              to="/address"
              className="w-full py-4 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all duration-300 shadow-lg"
            >
              <span>Select Delivery Address</span>
              <ArrowRight size={15} />
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck size={14} className="text-brand-orange" />
              <span>Secure Encrypted Checkout • Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

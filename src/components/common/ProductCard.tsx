import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice, calculateDiscount } from '../../utils/format';
import { StarRating } from './StarRating';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const discount = calculateDiscount(product.price, product.originalPrice);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group relative flex flex-col bg-dark-900/90 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-brand-orange/60 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-orange/10 hover:-translate-y-1">
      {/* Top-Left Floating Badges (ReiseMoto style) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
        {discount > 0 && (
          <span className="text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md">
            Save {discount}%
          </span>
        )}
        {product.badge && (
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-orange text-black shadow-md font-mono">
            {product.badge}
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-dark-850 p-3"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center rounded-xl transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay with Quick View link */}
        <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dark-900/95 border border-slate-700 text-xs font-bold text-white shadow-xl hover:bg-brand-orange hover:text-black hover:border-brand-orange transition-all">
            <Eye size={14} /> Quick View
          </span>
        </div>
      </Link>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="uppercase tracking-wider font-bold text-brand-orange font-mono truncate">
            {product.categoryLabel}
          </span>
          <span className="text-slate-500 uppercase tracking-wider font-medium">
            {product.brand}
          </span>
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.id}`}
          className="text-base font-bold text-white group-hover:text-brand-orange transition-colors line-clamp-2 leading-snug mb-2 font-heading"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={product.rating} reviewsCount={product.reviewsCount} />
        </div>

        {/* Pricing Row (ReiseMoto style: Price + Strikethrough + Save % Pill) */}
        <div className="mt-auto pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-lg sm:text-xl font-extrabold text-brand-orange font-mono">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-500 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white ml-auto">
                Save {discount}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mb-3.5">
            MRP inclusive of all taxes
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/product/${product.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-dark-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700/80 transition-colors"
            >
              Details <ArrowRight size={13} />
            </Link>
            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-brand-orange/15 border border-brand-orange/40 text-brand-orange hover:bg-brand-orange hover:text-black transition-all shadow-sm active:scale-95"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={13} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

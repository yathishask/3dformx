import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Receipt,
  Check,
  Share2,
  Layers,
} from 'lucide-react';
import { formatPrice, calculateDiscount } from '../utils/format';
import { StarRating } from '../components/common/StarRating';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { ProductVariant, Product } from '../types';
import { productService } from '../services/productService';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

    Promise.all([
      productService.getProductById(id),
      productService.getProducts(),
    ]).then(([foundProduct, allProducts]) => {
      if (!active) return;
      setProduct(foundProduct);
      if (foundProduct) {
        const related = allProducts
          .filter(
            (p) => p.category === foundProduct.category && p.id !== foundProduct.id
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } else {
        setRelatedProducts([]);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  // Initialize or reset selected variant when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-square rounded-3xl bg-dark-900 border border-slate-800 animate-pulse" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-6 w-32 bg-dark-850 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-dark-850 rounded animate-pulse" />
              <div className="h-24 w-full bg-dark-900 rounded-2xl animate-pulse" />
              <div className="h-14 w-full bg-dark-850 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-dark-900 border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 font-heading">
            Product Not Found
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            The product you are looking for is either unavailable or does not exist in our catalog.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
          >
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const finalUnitPrice = product.price + (selectedVariant?.priceModifier || 0);
  const discount = calculateDiscount(finalUnitPrice, product.originalPrice);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="hover:text-white transition-colors"
          >
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Hero Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Active Image Viewport */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-dark-900 border border-slate-800 p-6 flex items-center justify-center">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-orange text-black font-mono shadow-lg">
                  {product.badge}
                </span>
              )}
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain rounded-2xl transition-all duration-300"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-xl overflow-hidden bg-dark-900 border p-1 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-brand-orange ring-2 ring-brand-orange/30 shadow-md'
                        : 'border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Specs & Buy Box */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {/* Brand & Category */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
                {product.categoryLabel}
              </span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                title="Share product link"
              >
                <Share2 size={14} />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-3 font-heading">
              {product.name}
            </h1>

            {/* Rating & Tagline */}
            <div className="mb-4">
              <StarRating
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                size="md"
              />
            </div>
            {product.tagline && (
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                {product.tagline}
              </p>
            )}

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-dark-900 border border-slate-800 mb-6">
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-brand-orange font-mono">
                  {formatPrice(finalUnitPrice)}
                </span>
                {product.originalPrice && product.originalPrice > finalUnitPrice && (
                  <span className="text-base text-slate-500 line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                    Save {discount}%
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                MRP inclusive of all taxes.
              </div>
            </div>

            {/* Available Color / Variant Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 font-mono">
                  Select Option / Variant:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-brand-orange text-black font-bold shadow-md shadow-brand-orange/20 border-brand-orange'
                            : 'bg-dark-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {v.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span>{v.name}</span>
                        {v.priceModifier && v.priceModifier > 0 && (
                          <span className="text-[10px] opacity-80 font-mono">
                            (+{formatPrice(v.priceModifier)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center bg-dark-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-dark-800 transition-colors font-bold text-base"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-white font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-dark-800 transition-colors font-bold text-base"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  !product.inStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : addedAnim
                    ? 'bg-emerald-500 text-white scale-98'
                    : 'bg-brand-orange text-black hover:bg-brand-orange-hover hover:shadow-glow-orange active:scale-95'
                }`}
              >
                {!product.inStock ? (
                  <span>Out of Stock</span>
                ) : addedAnim ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Trust Points Checklist */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-brand-orange flex-shrink-0" />
                <span>Pan-India Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-orange flex-shrink-0" />
                <span>Quality Assured by FormX</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-brand-orange flex-shrink-0" />
                <span>GST Invoice Available</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-brand-orange flex-shrink-0" />
                <span>Easy Replacement Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs & Full Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Description & Key Highlights */}
          <div className="lg:col-span-7 bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-4 font-heading">
              Product Description & Details
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <>
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-orange mb-3 font-mono">
                  Key Highlights:
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check
                        size={16}
                        className="text-brand-orange mt-0.5 flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Specifications Table */}
          <div className="lg:col-span-5 bg-dark-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-4 font-heading flex items-center gap-2">
              <Layers size={18} className="text-brand-orange" />
              <span>Specifications</span>
            </h3>
            <div className="divide-y divide-slate-800">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="py-2.5 flex justify-between text-xs sm:text-sm"
                >
                  <span className="text-slate-400 font-medium">{key}</span>
                  <span className="text-white font-mono text-right font-semibold ml-4">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white font-heading">
                More in {product.categoryLabel}
              </h3>
              <Link
                to={`/shop?category=${product.category}`}
                className="text-xs font-bold text-brand-orange hover:text-white transition-colors"
              >
                View All {product.categoryLabel} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

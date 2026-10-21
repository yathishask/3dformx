import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { productService } from '../../services/productService';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    productService.getProducts().then((data) => {
      if (active && data.length > 0) {
        setProducts(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Show featured products first, followed by other products so the carousel can scroll smoothly
  const showcaseProducts = [
    ...products.filter((p) => p.isFeatured),
    ...products.filter((p) => !p.isFeatured),
  ].slice(0, 8);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 sm:py-20 bg-dark-950 border-b border-slate-800/80 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* ReiseMoto-Style Section Header: Bold Uppercase Left + Rounded Pill "View all" Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange font-mono block mb-1.5">
              3D FORMX SIGNATURE PICKS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight font-heading">
              EXPLORE BESTSELLERS & NEW ARRIVALS
            </h2>
          </div>

          <Link
            to="/shop"
            className="self-start sm:self-auto inline-flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-sm font-bold text-white hover:text-black transition-all duration-300 group shadow-lg"
          >
            <span>View all</span>
            <span className="w-6 h-6 rounded-full bg-dark-700 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>

        {/* Product Carousel Wrapper with Floating Left & Right Circular Arrow Buttons */}
        <div className="relative group/carousel">
          {/* Left Circular Navigation Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll products left"
            className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-dark-850/95 hover:bg-brand-orange text-white hover:text-black border border-slate-700 hover:border-brand-orange items-center justify-center shadow-2xl transition-all duration-200 focus:outline-none"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Horizontal Scrollable Row */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {showcaseProducts.map((product) => (
              <div
                key={product.id}
                className="w-[280px] sm:w-[310px] lg:w-[320px] flex-shrink-0 snap-start flex"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Circular Navigation Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll products right"
            className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-dark-850/95 hover:bg-brand-orange text-white hover:text-black border border-slate-700 hover:border-brand-orange items-center justify-center shadow-2xl transition-all duration-200 focus:outline-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

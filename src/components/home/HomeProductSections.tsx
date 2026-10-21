import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { Category } from '../../types/database';
import { productService } from '../../services/productService';

export const HomeProductSections: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      productService.getCategories(),
      productService.getProducts(),
    ]).then(([cats, prods]) => {
      if (active) {
        setCategories(cats);
        setProducts(prods);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // 1. Most Popular Products (prioritizes is_featured = true in Supabase, then rating/reviews)
  const mostPopularProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating * (b.reviewsCount || 1) - a.rating * (a.reviewsCount || 1);
      })
      .slice(0, 4);
  }, [products]);

  // 2. Latest Collection (sorted strictly by newest created_at timestamp regardless of category)
  const latestCollectionProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [products]);

  if (loading) {
    return (
      <div className="bg-dark-950 py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="h-8 w-56 bg-dark-850 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-[420px] rounded-2xl bg-dark-900 border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-950 divide-y divide-slate-800/80">
      {/* =====================================================================
          1. MOST POPULAR SECTION
      ===================================================================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange font-mono mb-2">
                <Flame size={15} className="text-brand-orange" />
                <span>CUSTOMER FAVORITES & BESTSELLERS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight font-heading">
                MOST POPULAR
              </h2>
            </div>

            <Link
              to="/shop?sort=popular"
              className="hidden sm:inline-flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-sm font-bold text-white hover:text-black transition-all duration-300 group shadow-lg"
            >
              <span>View More</span>
              <span className="w-6 h-6 rounded-full bg-dark-700 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {/* 4-Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostPopularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Bottom View More Button (Mobile) */}
          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to="/shop?sort=popular"
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-xs font-extrabold uppercase tracking-wider text-white hover:text-black transition-all"
            >
              <span>View More Popular Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. LATEST COLLECTION SECTION (All Categories, Newest First)
      ===================================================================== */}
      <section className="py-16 sm:py-20 bg-dark-900/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange font-mono mb-2">
                <Sparkles size={15} className="text-brand-orange" />
                <span>FRESHLY ADDED ACROSS ALL CATEGORIES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight font-heading">
                LATEST COLLECTION
              </h2>
            </div>

            <Link
              to="/shop?sort=latest"
              className="hidden sm:inline-flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-sm font-bold text-white hover:text-black transition-all duration-300 group shadow-lg"
            >
              <span>View More</span>
              <span className="w-6 h-6 rounded-full bg-dark-700 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {/* 4-Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestCollectionProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  badge: product.badge || 'New Arrival',
                }}
              />
            ))}
          </div>

          {/* Bottom View More Button (Mobile) */}
          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to="/shop?sort=latest"
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-xs font-extrabold uppercase tracking-wider text-white hover:text-black transition-all"
            >
              <span>View Full Latest Collection</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. ALL CATEGORIES ONE BY ONE (3 to 4 Products + View More)
      ===================================================================== */}
      {categories.map((category, index) => {
        const categoryProducts = products
          .filter((p) => p.category === category.slug)
          .slice(0, 4);

        const totalInCategory = products.filter(
          (p) => p.category === category.slug
        ).length;

        return (
          <section
            key={category.id || category.slug}
            className={`py-16 sm:py-20 ${
              index % 2 === 1 ? 'bg-dark-900/35' : 'bg-dark-950'
            }`}
          >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange font-mono mb-2">
                    <Layers size={14} className="text-brand-orange" />
                    <span>CATEGORY SHOWCASE • {totalInCategory} PRODUCTS</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight font-heading">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-slate-400 text-sm max-w-2xl mt-1.5">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Top-right View More pill button */}
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="self-start sm:self-auto inline-flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-full bg-dark-850 hover:bg-brand-orange border border-slate-700 hover:border-brand-orange text-sm font-bold text-white hover:text-black transition-all duration-300 group shadow-lg"
                >
                  <span>View More</span>
                  <span className="w-6 h-6 rounded-full bg-dark-700 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                    <ChevronRight size={14} />
                  </span>
                </Link>
              </div>

              {/* 3 to 4 Products in this Category */}
              {categoryProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Bottom "View More" Bar at the end of the Category's Products */}
                  <div className="mt-10 flex justify-center">
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-dark-900 hover:bg-brand-orange border border-slate-700/90 hover:border-brand-orange text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white hover:text-black transition-all duration-300 shadow-xl hover:scale-105 group"
                    >
                      <span>View All {category.name}</span>
                      <ArrowRight
                        size={16}
                        className="text-brand-orange group-hover:text-black transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-dark-900/60 border border-slate-800/80 p-8 text-center">
                  <p className="text-sm text-slate-400 mb-4">
                    No active products in <strong className="text-white">{category.name}</strong> yet.
                  </p>
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-orange text-black font-bold text-xs uppercase tracking-wider"
                  >
                    <span>Explore {category.name}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  PackageOpen,
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  ChevronDown,
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';
import { Category } from '../types/database';
import { productService } from '../services/productService';

type SortOption = 'popular' | 'latest' | 'price-low' | 'price-high' | 'rating';
type PriceFilterOption = 'all' | 'under-1000' | '1000-10000' | 'above-10000';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'popular';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [priceFilter, setPriceFilter] = useState<PriceFilterOption>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Load products and categories strictly from Supabase
  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      productService.getCategories(),
      productService.getProducts(),
    ]).then(([cats, prods]) => {
      if (active) {
        setDbCategories(cats);
        setProductsList(prods);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Keep state synced with URL category, search & sort params
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');

    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }

    const s = searchParams.get('sort') as SortOption | null;
    if (s && ['popular', 'latest', 'price-low', 'price-high', 'rating'].includes(s)) {
      setSortBy(s);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const nextParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catId);
    }
    setSearchParams(nextParams);
  };

  const handleSortChange = (nextSort: SortOption) => {
    setSortBy(nextSort);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', nextSort);
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setPriceFilter('all');
    setInStockOnly(false);
    setSearchParams({});
  };

  // Determine active category metadata strictly from Supabase categories
  const activeCategoryMeta = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const dbCat = dbCategories.find((c) => c.slug === selectedCategory);
    if (dbCat) {
      return {
        name: dbCat.name,
        description:
          dbCat.description ||
          `Explore all ${dbCat.name} products from 3D FormX. Use search and filters below to find your exact match.`,
      };
    }
    return {
      name: selectedCategory,
      description: 'Browse all products in this category.',
    };
  }, [selectedCategory, dbCategories]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 3. Price Range Filter
    if (priceFilter === 'under-1000') {
      result = result.filter((p) => p.price < 1000);
    } else if (priceFilter === '1000-10000') {
      result = result.filter((p) => p.price >= 1000 && p.price <= 10000);
    } else if (priceFilter === 'above-10000') {
      result = result.filter((p) => p.price > 10000);
    }

    // 4. In-Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // 5. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'latest') {
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } else {
      // 'popular' (is_featured first, then rating * reviewsCount)
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating * (b.reviewsCount || 1) - a.rating * (a.reviewsCount || 1);
      });
    }

    return result;
  }, [selectedCategory, searchQuery, priceFilter, inStockOnly, sortBy, productsList]);

  // Dynamic category tabs calculated strictly from Supabase categories + product counts
  const categoryTabs = useMemo(() => {
    const tabs = [{ id: 'all', label: 'All Categories', count: productsList.length }];

    dbCategories.forEach((cat) => {
      const count = productsList.filter((p) => p.category === cat.slug).length;
      tabs.push({
        id: cat.slug,
        label: cat.name,
        count,
      });
    });

    return tabs;
  }, [dbCategories, productsList]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    priceFilter !== 'all' ||
    inStockOnly;

  return (
    <div className="min-h-screen bg-dark-950 py-10 sm:py-14">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Breadcrumb / Back to Home */}
        <div className="mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Dynamic Page Header (shows Selected Category, Latest Collection, or Most Popular) */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange font-mono mb-2">
            <span>
              {activeCategoryMeta
                ? `CATEGORY COLLECTION`
                : sortBy === 'latest'
                ? 'NEW ARRIVALS'
                : '3D FORMX CATALOG'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight font-heading">
            {activeCategoryMeta
              ? activeCategoryMeta.name
              : sortBy === 'latest'
              ? 'Latest Collection'
              : sortBy === 'popular'
              ? 'Most Popular Products'
              : 'All Products'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            {activeCategoryMeta
              ? activeCategoryMeta.description
              : sortBy === 'latest'
              ? 'Browse the newest products freshly added across all categories.'
              : 'Explore our complete lineup of 3D creations, collectibles, printers, and precision hardware.'}
          </p>
        </div>

        {/* Controls Panel: Search Bar, Sort Dropdown, Price Filter, In-Stock Filter, Category Pills */}
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 mb-8 shadow-xl">
          {/* Top Row: Search Input + Filter Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeCategoryMeta
                    ? `Search in ${activeCategoryMeta.name}...`
                    : 'Search products by name, category, keywords...'
                }
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-dark-850 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Controls: Clean 2-column grid on mobile, inline flex on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              {/* Price Filter Dropdown */}
              <div className="relative col-span-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange">
                  <IndianRupee size={13} />
                </div>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilterOption)}
                  aria-label="Filter by price"
                  className="w-full sm:w-auto appearance-none pl-7 pr-8 py-2.5 rounded-xl bg-dark-850 border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:border-brand-orange cursor-pointer transition-colors"
                >
                  <option value="all">All Prices</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="1000-10000">₹1,000 – ₹10,000</option>
                  <option value="above-10000">Above ₹10,000</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Sort Options Dropdown */}
              <div className="relative col-span-1">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange">
                  <ArrowUpDown size={13} />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  aria-label="Sort products by"
                  className="w-full sm:w-auto appearance-none pl-7 pr-8 py-2.5 rounded-xl bg-dark-850 border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:border-brand-orange cursor-pointer transition-colors"
                >
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* In-Stock Toggle Button */}
              <button
                type="button"
                onClick={() => setInStockOnly((prev) => !prev)}
                className={`col-span-2 sm:col-span-1 w-full sm:w-auto px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  inStockOnly
                    ? 'bg-brand-orange/15 border-brand-orange text-brand-orange font-bold'
                    : 'bg-dark-850 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <CheckCircle2 size={14} className={inStockOnly ? 'text-brand-orange' : 'text-slate-500'} />
                <span>In Stock Only</span>
                {inStockOnly && (
                  <span className="text-[10px] bg-brand-orange text-black font-extrabold px-1.5 py-0.2 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Pills Row */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                <SlidersHorizontal size={13} className="text-brand-orange" />
                <span>Categories</span>
              </span>
              <span className="text-[10px] text-slate-500 sm:hidden">
                Swipe for more →
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              {categoryTabs.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      active
                        ? 'bg-brand-orange text-black font-extrabold shadow-md shadow-brand-orange/20'
                        : 'bg-dark-800 text-slate-300 hover:text-white hover:bg-dark-750 border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active ? 'bg-black/25 text-black' : 'bg-dark-950 text-slate-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>
            Showing <strong className="text-white">{filteredProducts.length}</strong>{' '}
            {activeCategoryMeta ? (
              <>
                products in <strong className="text-brand-orange">{activeCategoryMeta.name}</strong>
              </>
            ) : (
              <>
                of <strong className="text-white">{productsList.length}</strong> total products
              </>
            )}
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-brand-orange hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={13} /> Reset All Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-[420px] rounded-2xl bg-dark-900 border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="text-center py-24 bg-dark-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-dark-850 border border-slate-700 text-brand-orange flex items-center justify-center mx-auto mb-4">
              <PackageOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">
              No matching products found
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              We couldn't find any products matching your current search or filter settings. Try clearing your filters or browse all categories.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-full bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors shadow-lg shadow-brand-orange/20"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

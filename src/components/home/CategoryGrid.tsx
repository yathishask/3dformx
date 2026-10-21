import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Cpu, Sparkles, Scan, Wrench, LucideIcon } from 'lucide-react';
import { productService } from '../../services/productService';
import { Category } from '../../types/database';
import { Product } from '../../types';

const ICON_MAP: Record<string, LucideIcon> = {
  printers: Cpu,
  filaments: Layers,
  resins: Sparkles,
  scanners: Scan,
  accessories: Wrench,
};

// Default fallback items until Supabase data loads
const FALLBACK_CATEGORIES = [
  {
    id: 'c1',
    slug: 'printers',
    name: 'Industrial 3D Printers',
    description: 'High-speed CoreXY & 8K SLA stations with active thermal control',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '',
  },
  {
    id: 'c2',
    slug: 'filaments',
    name: 'Carbon & Engineering Filaments',
    description: 'Continuous Carbon Fiber PEEK, PA12, High-Speed Silk PLA & TPU',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '',
  },
  {
    id: 'c3',
    slug: 'resins',
    name: '8K Photopolymer Resins',
    description: 'ABS-like ToughFlex and zero-ash investment castable formulations',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '',
  },
  {
    id: 'c4',
    slug: 'scanners',
    name: 'Metrology 3D Scanners',
    description: 'Blue laser crossed-beam and automated turntable metrology',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '',
  },
  {
    id: 'c5',
    slug: 'accessories',
    name: 'Hardware & Spare Parts',
    description: 'PCD Diamond-Ti nozzles, PEI magnetic beds, and multi-dryboxes',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: '',
  },
];

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    productService.getCategories().then((cats) => {
      if (active && cats.length > 0) {
        setCategories(cats);
      }
    });
    productService.getProducts().then((prods) => {
      if (active && prods.length > 0) {
        setProducts(prods);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-20 bg-dark-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
              CURATED ECOSYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
              Browse by Category
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mt-2">
              Everything required to establish an advanced additive manufacturing workflow, ready to ship across India.
            </p>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-orange hover:text-white transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = ICON_MAP[cat.slug] || Cpu;
            const isWide = idx === 0;
            const count = products.filter((p) => p.category === cat.slug).length;
            const countLabel = count > 0 ? `${count} ${count === 1 ? 'Product' : 'Products'}` : 'View Range';

            return (
              <Link
                key={cat.id || cat.slug}
                to={`/shop?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-dark-900 border border-slate-800 p-6 flex flex-col justify-end min-h-[280px] hover:border-brand-orange/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-orange/10 ${
                  isWide ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center filter brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.45] transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/20 border border-brand-orange/40 text-brand-orange flex items-center justify-center">
                      <IconComponent size={20} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 bg-dark-950/80 px-2.5 py-1 rounded-full border border-slate-700/60">
                      {countLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors font-heading">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 mb-4 line-clamp-2">
                    {cat.description || 'Explore our high-performance 3D printing equipment and materials.'}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    <span>Explore Range</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

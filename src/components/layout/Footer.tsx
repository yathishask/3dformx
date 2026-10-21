import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { Category } from '../../types/database';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    productService.getCategories().then((cats) => {
      if (active && cats.length > 0) {
        setCategories(cats);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-dark-950 border-t border-slate-800/80 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="inline-block">
              <img
                src="/images/logo-transparent.png"
                alt="3D FormX"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              3D FormX is India's premier additive manufacturing hardware provider. From high-speed CoreXY 3D printers and 8K SLA resin stations to continuous carbon-fiber composites and metrology laser scanners.
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-orange flex-shrink-0" />
                Peenya Industrial Area, Phase 1, Bengaluru, Karnataka - 560058
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-brand-orange flex-shrink-0" />
                1800-334-3676 (India Toll-Free)
              </span>
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-brand-orange flex-shrink-0" />
                support@3dformx.in
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-heading">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="hover:text-brand-orange transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-heading">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="hover:text-brand-orange transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-orange transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-orange transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  1-Year Warranty Terms
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  18% GST Compliance
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Club */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-2 font-heading">
              FormX Insider
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Get technical additive whitepapers, material releases, and ₹ 500 off your first hardware order.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs">
                <CheckCircle size={16} />
                <span>Thank you! Voucher code sent to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email ID"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all"
                >
                  Join Club <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} 3D FormX India Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck size={14} className="text-brand-orange" />
              100% Authentic Additive Hardware & Certified Polymers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

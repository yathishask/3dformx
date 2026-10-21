import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  User as UserIcon,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { Category } from '../../types/database';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const { totalItems } = useCart();
  const { user, profile, openAuthModal, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === '/';

  // Fetch dynamic categories and products from Supabase
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
  }, [location.pathname]);

  // Listen to window scroll to switch between transparent overlay header and solid sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.search]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Filtered instant search suggestions
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Determine whether header is currently transparent over the hero or solid
  const isTransparentOverlay = isHome && !isScrolled && !searchOpen && !mobileMenuOpen;

  return (
    <>
      {/* 1. Top Black Utility Bar (Track Orders + Social Icons like ReiseMoto) */}
      <div className="bg-black text-white text-xs py-2 px-4 sm:px-8 lg:px-12 border-b border-white/10 relative z-50">
        <div className="max-w-[1440px] mx-auto flex items-center justify-end gap-6">
          <Link
            to="/orders"
            className="text-[11px] sm:text-xs font-medium text-slate-200 hover:text-brand-orange transition-colors tracking-wide"
          >
            Track Orders
          </Link>

          {/* Social Links */}
          <div className="flex items-center gap-3.5 text-white">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-brand-orange transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-brand-orange transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 stroke-current fill-none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="hover:text-brand-orange transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-brand-orange transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header: Transparent over Hero initially, Solid Dark Charcoal when Scrolled */}
      <header
        className={`${
          isScrolled
            ? 'fixed top-0 left-0 right-0 bg-dark-950/95 backdrop-blur-md border-b border-slate-800/90 shadow-2xl py-3.5'
            : isHome
            ? `absolute top-[33px] left-0 right-0 py-5 ${
                isTransparentOverlay
                  ? 'bg-gradient-to-b from-black/75 via-black/35 to-transparent'
                  : 'bg-dark-950/95 backdrop-blur-md'
              }`
            : 'sticky top-0 left-0 right-0 bg-dark-950 border-b border-slate-800/90 py-4'
        } z-40 transition-all duration-300`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <img
                src="/images/logo-transparent.png"
                alt="3D FormX"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </Link>

            {/* Center: Dynamic Categories + Festive Sale Pill (Desktop) */}
            <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-1 px-6">
              {categories.map((cat) => {
                const isActive =
                  location.pathname === '/shop' &&
                  new URLSearchParams(location.search).get('category') === cat.slug;

                return (
                  <Link
                    key={cat.id || cat.slug}
                    to={`/shop?category=${cat.slug}`}
                    className={`text-sm font-semibold tracking-wide transition-colors whitespace-nowrap drop-shadow-sm ${
                      isActive
                        ? 'text-brand-orange'
                        : 'text-white hover:text-brand-orange'
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Minimal Search, User, and Cart Icons */}
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="text-white hover:text-brand-orange transition-colors p-1 focus:outline-none drop-shadow-sm"
                aria-label="Search products"
                title="Search"
              >
                <Search size={21} strokeWidth={1.8} />
              </button>

              {/* User Icon / Account Menu */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 text-white hover:text-brand-orange transition-colors p-1 focus:outline-none drop-shadow-sm"
                      title={profile?.full_name || user.email || 'Account'}
                    >
                      <UserIcon size={21} strokeWidth={1.8} className="text-brand-orange" />
                      <span className="hidden xl:inline text-xs font-bold max-w-[100px] truncate">
                        {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
                        <div className="px-3 py-2 border-b border-slate-800 mb-2">
                          <p className="text-xs font-bold text-white truncate">
                            {profile?.full_name || '3D FormX Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/cart"
                          className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-dark-800 rounded-xl transition-colors"
                        >
                          <span>My Cart ({totalItems})</span>
                          <ArrowRight size={13} />
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-dark-800 rounded-xl transition-colors"
                        >
                          <span>My Orders</span>
                          <ArrowRight size={13} />
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={openAuthModal}
                    className="text-white hover:text-brand-orange transition-colors p-1 focus:outline-none drop-shadow-sm"
                    aria-label="Sign in"
                    title="Sign In / Register"
                  >
                    <UserIcon size={21} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative text-white hover:text-brand-orange transition-colors p-1 drop-shadow-sm"
                aria-label="View shopping cart"
                title="Cart"
              >
                <ShoppingCart size={21} strokeWidth={1.8} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-orange text-black font-extrabold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-mono shadow-md">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden text-white hover:text-brand-orange transition-colors p-1"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar Overlay */}
        {searchOpen && (
          <div className="bg-dark-950/98 border-t border-b border-slate-800 mt-3 py-4 px-4 sm:px-8 animate-slide-down shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-brand-orange" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 3D printers, gifts, F1 collectibles, keychains..."
                  className="w-full bg-dark-900 border border-slate-700 rounded-full pl-11 pr-24 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Instant Search Suggestions */}
              {searchResults.length > 0 && (
                <div className="mt-3 bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between p-3 hover:bg-dark-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-dark-950"
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-brand-orange font-mono uppercase">
                            {item.categoryLabel}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {formatPrice(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-dark-950/98 backdrop-blur-xl border-b border-slate-800 px-5 pt-4 pb-6 mt-3 animate-slide-down">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-dark-800"
              >
                Home
              </Link>

              <div className="pt-1 pb-1">
                <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat.slug}
                    to={`/shop?category=${cat.slug}`}
                    className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-brand-orange hover:bg-dark-800 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/orders"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-dark-900 text-xs font-bold text-slate-200 hover:text-brand-orange"
                    >
                      <span>My Orders</span>
                      <ArrowRight size={14} />
                    </Link>
                    <div className="flex items-center justify-between px-3 py-2 bg-dark-900 rounded-xl">
                      <span className="text-xs text-slate-300 font-mono truncate">
                        {profile?.full_name || user.email}
                      </span>
                      <button
                        onClick={() => signOut()}
                        className="text-xs text-rose-400 font-bold uppercase hover:underline"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-dark-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider text-center hover:border-brand-orange"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import AuthModal from '@/components/AuthModal';
import { IProduct } from '@/lib/types';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Layers,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Modals
  const [previewProduct, setPreviewProduct] = useState<IProduct | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (inStockOnly) params.append('inStock', 'true');
      if (sort) params.append('sort', sort);
      if (minPrice !== undefined) params.append('minPrice', String(minPrice));
      if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search, inStockOnly, sort, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setInStockOnly(false);
    setSort('newest');
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar
        searchValue={search}
        onSearchChange={setSearch}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-6 py-12 sm:px-12 sm:py-16 text-white shadow-xl mb-10 border border-zinc-800">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next.js 16 • MongoDB • Stripe Test Mode</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Curated Fashion, Bestselling Books &amp; Modern Tech.
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              Shop 150+ Men&apos;s, Women&apos;s &amp; Children&apos;s fashion styles, acclaimed literature, and premier tech devices with real-time inventory management and Stripe Test Mode checkout.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <button
                onClick={() => {
                  const catalogElem = document.getElementById('catalog-section');
                  catalogElem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-zinc-950 font-bold shadow-md hover:bg-zinc-100 transition-colors"
              >
                Browse Catalog <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-xl bg-[#00a389] px-5 py-3 text-white font-bold shadow-md hover:bg-[#008f77] transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Open Vendra Admin Panel
              </Link>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                Switch Roles (Admin / User)
              </button>
            </div>
          </div>

          {/* Quick Perks Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-800/80 pt-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Instant Stock Decrement</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Stripe Test Mode Simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Live Admin Inventory CRUD</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <span>End-to-End Order Tracking</span>
            </div>
          </div>
        </div>

        {/* Quick Shopping Departments Strip */}
        <div className="mb-8 rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              🛍️ Shop by Department — Fashion (Men, Women, Kids), Books &amp; Tech
            </span>
            <span className="text-[11px] text-orange-500 dark:text-orange-400 font-bold">
              150+ Fashion Styles &amp; Books
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Catalog', cat: 'All', icon: '✨' },
              { label: "Men's Fashion (50 Styles)", cat: "Men's Fashion", icon: '👔' },
              { label: "Women's Dresses (50 Styles)", cat: "Women's Fashion", icon: '👗' },
              { label: "Kids & Children (50 Styles)", cat: "Kids & Children", icon: '🧸' },
              { label: 'Books & Literature', cat: 'Books', icon: '📚' },
              { label: 'Smartphones & Tech', cat: 'Electronics', icon: '📱' },
              { label: 'Laptops & Workstations', cat: 'Computing', icon: '💻' },
              { label: 'Gaming Consoles', cat: 'Gaming', icon: '🎮' },
              { label: 'Audio & Sound', cat: 'Audio', icon: '🎧' },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => {
                  setCategory(d.cat);
                  const catalogElem = document.getElementById('catalog-section');
                  catalogElem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  category === d.cat && d.cat !== 'All'
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Section */}
        <section id="catalog-section">
          {/* Filters & Sorting */}
          <ProductFilter
            category={category}
            onSelectCategory={setCategory}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            sort={sort}
            onSelectSort={setSort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            onReset={handleResetFilters}
            totalResults={products.length}
          />

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse h-80"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-xs my-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                No products match your criteria
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Try adjusting your search query, clearing price filters, or allowing out-of-stock items.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onPreview={(p) => setPreviewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <ProductModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

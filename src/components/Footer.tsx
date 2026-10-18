'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, CreditCard, RefreshCw, Layers, ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
                <Image src="/vendra-logo.png" alt="Vendra Logo" fill className="object-contain p-0.5" />
              </div>
              <span className="text-lg font-black text-zinc-900 dark:text-white">
                Ven<span className="text-orange-500">dra</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Modern full-spectrum e-commerce platform offering Men&apos;s, Women&apos;s, Children&apos;s fashion, Bestselling Books, and high-performance electronics.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Shield className="h-3 w-3" /> Stripe Test Mode Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
              Storefront
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Vendra Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
              Fashion & Books
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>Men&apos;s Collection (50 styles)</li>
              <li>Women&apos;s Dresses & Gowns (50 styles)</li>
              <li>Kids &amp; Children&apos;s Wear (50 styles)</li>
              <li>Bestselling Books &amp; Literature</li>
            </ul>
          </div>

          {/* Platform Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
              Architecture & Features
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-indigo-500" /> Stripe Test Simulator
              </li>
              <li className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-500" /> Real-time Inventory Guard
              </li>
              <li className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-violet-500" /> Role-based Auth (Admin/User)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Vendra E-commerce Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Next.js 16 • MongoDB • Stripe Test • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingCart,
  ShieldCheck,
  User,
  LogOut,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onOpenAuthModal?: () => void;
}

export default function Navbar({ onSearchChange, searchValue = '', onOpenAuthModal }: NavbarProps) {
  const { user, logout, quickLogin } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/vendra-logo.png"
                alt="Vendra Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                Ven<span className="text-orange-500 dark:text-orange-400">dra</span>
              </span>
              <span className="hidden text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 sm:block">
                Fashion, Devices & Books
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Catalog
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Package className="h-4 w-4" />
              Track Orders
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
            >
              <ShieldCheck className="h-4 w-4" />
              Vendra Admin Dashboard
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        {onSearchChange !== undefined && (
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, brands, tags..."
                className="w-full rounded-full border border-zinc-200 bg-zinc-50/60 py-2 pl-4 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-white dark:placeholder-zinc-500"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher if not logged in */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-zinc-500 text-[11px] font-medium mr-1">Demo Quick-Login:</span>
              <button
                onClick={() => quickLogin('admin')}
                className="rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                title="Login with full Admin permissions"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('customer')}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                title="Login as regular customer"
              >
                User
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-2 pr-3 text-xs font-medium text-zinc-800 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  {user.role}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Sign-In button if not logged in */}
          {!user && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <User className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Phones and Tablets */}
      <div className="flex md:hidden items-center justify-between border-t border-zinc-200/60 bg-white/95 px-4 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-950/95 overflow-x-auto">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Link href="/" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300">
            Catalog
          </Link>
          <Link href="/orders" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300">
            Track Orders
          </Link>
          <Link href="/admin" className="text-emerald-600 font-bold dark:text-emerald-400">
            Vendra Admin
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap pl-2">
          <button
            onClick={() => quickLogin('admin')}
            className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300"
          >
            Admin
          </button>
          <button
            onClick={() => quickLogin('customer')}
            className="rounded bg-zinc-200 px-2 py-0.5 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
          >
            User
          </button>
        </div>
      </div>
    </header>
  );
}

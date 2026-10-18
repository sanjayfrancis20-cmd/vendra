'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/initialData';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

interface ProductFilterProps {
  category: string;
  onSelectCategory: (cat: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sort: string;
  onSelectSort: (sort: string) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
  onReset: () => void;
  totalResults: number;
}

export default function ProductFilter({
  category,
  onSelectCategory,
  inStockOnly,
  onToggleInStock,
  sort,
  onSelectSort,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
  totalResults,
}: ProductFilterProps) {
  const priceRanges = [
    { label: 'All Prices', min: undefined, max: undefined },
    { label: 'Under $150', min: 0, max: 150 },
    { label: '$150 – $350', min: 150, max: 350 },
    { label: '$350 & Above', min: 350, max: undefined },
  ];

  const isCurrentRange = (min?: number, max?: number) => {
    return minPrice === min && maxPrice === max;
  };

  const hasActiveFilters =
    category !== 'All' || inStockOnly || minPrice !== undefined || maxPrice !== undefined || sort !== 'newest';

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mb-8">
      {/* Top Bar: Categories & Results */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = category.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Controls: In Stock & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* In Stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onToggleInStock(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSelectSort(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Sub Bar: Price Filter pills & summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300 mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Price:
          </span>
          {priceRanges.map((r, idx) => {
            const active = isCurrentRange(r.min, r.max);
            return (
              <button
                key={idx}
                onClick={() => onPriceChange(r.min, r.max)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {active && <Check className="inline-block h-3 w-3 mr-1" />}
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 sm:mt-0 font-medium text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-semibold text-zinc-900 dark:text-white">{totalResults}</span> products
        </div>
      </div>
    </div>
  );
}

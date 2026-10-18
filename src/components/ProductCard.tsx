'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Check, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: IProduct;
  onPreview: (product: IProduct) => void;
}

export default function ProductCard({ product, onPreview }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cartItem = items.find((it) => it.product._id === product._id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isMaxInCart = currentInCart >= product.stock && product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMsg(null);
    const res = addToCart(product, 1);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } else {
      setErrorMsg(res.message || 'Cannot add item');
      setTimeout(() => setErrorMsg(null), 2500);
    }
  };

  return (
    <div
      onClick={() => onPreview(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800/80 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Pill */}
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute right-3 top-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              <AlertTriangle className="h-3 w-3" />
              Only {product.stock} Left!
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
              In Stock ({product.stock})
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-zinc-400">
            ({product.reviewsCount})
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>

        {/* Description snippet */}
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {product.description}
        </p>

        {/* Error message banner if stock cap reached */}
        {errorMsg && (
          <div className="mt-2 rounded-lg bg-red-50 p-2 text-[11px] font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Pricing & Add to cart button */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {currentInCart > 0 && (
              <span className="text-[10px] text-indigo-600 font-semibold dark:text-indigo-400">
                {currentInCart} in cart
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxInCart}
            className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-all ${
              isOutOfStock
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                : isMaxInCart
                ? 'cursor-not-allowed bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/25 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-400 dark:hover:text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : isMaxInCart ? (
              'Max Stock'
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

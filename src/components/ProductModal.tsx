'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, AlertTriangle } from 'lucide-react';

interface ProductModalProps {
  product: IProduct | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!product) return null;

  const cartItem = items.find((it) => it.product._id === product._id);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const maxAddable = Math.max(0, product.stock - currentInCart);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    setErrorMsg(null);
    const res = addToCart(product, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      setErrorMsg(res.message || 'Cannot add requested quantity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-zinc-700 hover:bg-black/20 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/20 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative aspect-square md:aspect-auto min-h-[300px] w-full bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {product.category}
              </span>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              {/* Rating & Stock */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    ({product.reviewsCount} reviews)
                  </span>
                </div>

                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" />
                    Only {product.stock} units left!
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    In Stock ({product.stock})
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Save ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {product.description}
              </p>

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-zinc-400 block text-[10px]">{key}</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
              {errorMsg && (
                <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                {!isOutOfStock && (
                  <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-white disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
                      disabled={quantity >= maxAddable}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-600 hover:bg-white disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || maxAddable <= 0}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-5 text-xs font-bold text-white shadow-lg transition-all ${
                    isOutOfStock
                      ? 'cursor-not-allowed bg-zinc-300 dark:bg-zinc-700'
                      : maxAddable <= 0
                      ? 'cursor-not-allowed bg-zinc-400'
                      : added
                      ? 'bg-emerald-600'
                      : 'bg-zinc-900 hover:bg-indigo-600 shadow-zinc-900/10 hover:shadow-indigo-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added to Cart
                    </>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : maxAddable <= 0 ? (
                    'Max Quantity in Cart'
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" /> Add to Cart — ${(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-indigo-500" /> Free Shipping $150+
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 2-Yr Warranty
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 text-violet-500" /> 30-Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

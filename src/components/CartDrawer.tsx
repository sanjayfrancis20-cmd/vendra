'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    total,
    totalItems,
    setIsCheckoutOpen,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setPromoInput('');
    }
    setTimeout(() => setPromoMsg(null), 3000);
  };

  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Your Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="bg-indigo-50/60 px-5 py-2.5 border-b border-indigo-100/60 dark:bg-indigo-950/30 dark:border-indigo-900/40">
              <div className="flex justify-between text-xs font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                {amountToFreeShipping === 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> You unlocked Free Shipping!
                  </span>
                ) : (
                  <span>Add ${amountToFreeShipping.toFixed(2)} more for Free Shipping</span>
                )}
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-indigo-200/50 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-xs text-zinc-500 max-w-[200px]">
                  Explore our premium tech catalog and add your favorite items.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-400 dark:hover:text-white transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  className="flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-800/40"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="line-clamp-1 text-xs font-bold text-zinc-900 dark:text-white">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors ml-2"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        ${product.price}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="flex h-6 w-6 items-center justify-center rounded text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {quantity >= product.stock && (
                      <span className="text-[10px] text-amber-600 font-medium mt-1">
                        Max stock reached ({product.stock})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (SAVE10 or VIP20)"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-1.5 pl-8 pr-3 text-xs uppercase text-zinc-900 placeholder:normal-case placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span>Code <strong>{appliedPromo}</strong> active (-${discount})</span>
                  <button onClick={removePromoCode} className="text-emerald-800 dark:text-emerald-200 hover:underline text-[11px]">
                    Remove
                  </button>
                </div>
              )}

              {promoMsg && (
                <p className={`text-[11px] ${promoMsg.error ? 'text-red-500' : 'text-emerald-600'}`}>
                  {promoMsg.text}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-500 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <span>Total</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
              >
                Checkout Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

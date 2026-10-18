'use client';

import React, { useState, useEffect } from 'react';
import { IProduct } from '@/lib/types';
import { CATEGORIES } from '@/lib/initialData';
import { X, Save, Plus, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: IProduct | null;
  onSaved: () => void;
}

export default function AdminProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaved,
}: AdminProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Audio');
  const [price, setPrice] = useState(199);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(249);
  const [stock, setStock] = useState(15);
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStock(productToEdit.stock);
      setImage(productToEdit.image);
      setTags(productToEdit.tags?.join(', ') || '');
    } else {
      setName('');
      setDescription('');
      setCategory('Audio');
      setPrice(149);
      setOriginalPrice(189);
      setStock(20);
      setImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80');
      setTags('new, premium, tech');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        stock: Number(stock),
        image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const url = productToEdit
        ? `/api/products/${productToEdit._id}`
        : '/api/products';
      const method = productToEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {productToEdit ? 'Edit Product Details' : 'Add New Catalog Product'}
              </h2>
              <p className="text-[11px] text-zinc-500">Configure inventory, pricing, and specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-2.5 text-red-600 font-semibold dark:bg-red-950/40 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aura Studio Monitor"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Stock Quantity (Inventory)
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Original Price ($) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={originalPrice ?? ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="249.00"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High performance studio grade..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="wireless, premium, audio"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
            />
          </div>

          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

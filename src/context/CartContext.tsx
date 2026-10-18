'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IProduct, ICartItem, IOrder } from '@/lib/types';

interface CartContextType {
  items: ICartItem[];
  addToCart: (product: IProduct, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  subtotal: number;
  shippingFee: number;
  discount: number;
  appliedPromo: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastConfirmedOrder: IOrder | null;
  setLastConfirmedOrder: (order: IOrder | null) => void;
  activeInvoiceOrder: IOrder | null;
  setActiveInvoiceOrder: (order: IOrder | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<IOrder | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<IOrder | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecom_cart_v1');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecom_cart_v1', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: IProduct, quantity: number = 1): { success: boolean; message?: string } => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    const existingIndex = items.findIndex((it) => it.product._id === product._id);
    const currentQtyInCart = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > product.stock) {
      return {
        success: false,
        message: `Cannot add more. Only ${product.stock} available in stock.`,
      };
    }

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity = requestedTotal;
      setItems(updated);
    } else {
      setItems([...items, { product, quantity }]);
    }

    setIsCartOpen(true);
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = items.find((it) => it.product._id === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (quantity > item.product.stock) {
      return {
        success: false,
        message: `Maximum available inventory for this item is ${item.product.stock}.`,
      };
    }

    setItems((prev) =>
      prev.map((it) => (it.product._id === productId ? { ...it, quantity } : it))
    );
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    setDiscount(0);
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SAVE10') {
      setAppliedPromo('SAVE10');
      setDiscount(10);
      return { success: true, message: 'Promo code applied! $10 discount.' };
    }
    if (clean === 'VIP20') {
      setAppliedPromo('VIP20');
      setDiscount(20);
      return { success: true, message: 'VIP promo code applied! $20 discount.' };
    }
    return { success: false, message: 'Invalid promo code. Try "SAVE10" or "VIP20".' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
  };

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const shippingFee = subtotal > 150 || items.length === 0 ? 0 : 15;
  const total = Math.max(0, subtotal + shippingFee - discount);
  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingFee,
        discount,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        total,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastConfirmedOrder,
        setLastConfirmedOrder,
        activeInvoiceOrder,
        setActiveInvoiceOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { useAuth } from '@/context/AuthContext';
import { IOrder } from '@/lib/types';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Phone,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  FileText,
  Zap,
  Printer,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const { setActiveInvoiceOrder } = useCart();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/orders';
      if (!user && filterEmail) {
        url += `?email=${encodeURIComponent(filterEmail)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                PURCHASE HISTORY
              </span>
              <span className="text-xs text-zinc-400">• Stripe Verified Fulfillment</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              My Orders & Shipments
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <RotateCw className="h-3.5 w-3.5" /> Refresh Orders
          </button>
        </div>

        {/* Lookup for non-logged-in users */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Find orders by email (e.g. user@store.com)..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
            <button
              onClick={fetchOrders}
              className="w-full sm:w-auto rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-colors dark:bg-white dark:text-zinc-900"
            >
              Lookup
            </button>
          </div>
        )}

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
              No orders found
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Visit our product catalog to test checkout with Stripe Test Mode simulation!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
            >
              Explore Catalog <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ord.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-zinc-400 block">Total Amount</span>
                      <span className="text-base font-black text-zinc-900 dark:text-white">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveInvoiceOrder(ord)}
                      className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 transition-colors"
                      title="View and print official automated tax bill / invoice"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Tax Bill</span>
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4 space-y-3">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                          <Image src={it.image} alt={it.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            {it.name}
                          </p>
                          <span className="text-[11px] text-zinc-400">
                            Quantity: {it.quantity} × ${it.price}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        ${(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment details */}
                <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-zinc-500 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      <span>
                        Shipping to: <strong className="text-zinc-800 dark:text-zinc-200">{ord.customerName}</strong> —{' '}
                        {ord.shippingAddress.street}
                        {ord.shippingAddress.apartment ? `, ${ord.shippingAddress.apartment}` : ''}, {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.postalCode}
                      </span>
                    </div>

                    {(ord.customerPhone || ord.shippingAddress.phone) && (
                      <div className="flex items-center gap-1 text-zinc-500 flex-shrink-0">
                        <Phone className="h-3 w-3 text-zinc-400" />
                        <span>{ord.customerPhone || ord.shippingAddress.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100/60 dark:border-zinc-800/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Method:</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {ord.shippingAddress.shippingMethod === 'express'
                          ? '⚡ Express Delivery (1-2 Days)'
                          : ord.shippingAddress.shippingMethod === 'overnight'
                          ? '🚀 Overnight Priority'
                          : '🚚 Standard Shipping'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400">Payment:</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          ord.paymentMethod === 'cod'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : ord.paymentMethod === 'upi'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ord.paymentMethod === 'net_banking'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {ord.paymentMethod === 'cod'
                          ? '💵 Cash on Delivery'
                          : ord.paymentMethod === 'upi'
                          ? `📱 UPI (${ord.paymentDetails?.upiId || 'Wallet'})`
                          : ord.paymentMethod === 'net_banking'
                          ? `🏦 Net Banking (${ord.paymentDetails?.bankName || 'Bank'})`
                          : `💳 Stripe Test Card (${ord.paymentDetails?.cardLast4 ? `•••• ${ord.paymentDetails.cardLast4}` : '•••• 4242'})`}
                      </span>
                    </div>
                  </div>

                  {ord.shippingAddress.deliveryNotes && (
                    <div className="text-[11px] text-zinc-400 italic">
                      Note: &quot;{ord.shippingAddress.deliveryNotes}&quot;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  PackageCheck,
  ArrowRight,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  FileText,
  Clock,
  Printer,
} from 'lucide-react';

export default function OrderSuccessModal() {
  const { lastConfirmedOrder, setLastConfirmedOrder, setActiveInvoiceOrder } = useCart();

  if (!lastConfirmedOrder) return null;

  const isCod = lastConfirmedOrder.paymentMethod === 'cod';
  const isUpi = lastConfirmedOrder.paymentMethod === 'upi';
  const isNetBanking = lastConfirmedOrder.paymentMethod === 'net_banking';

  const getPaymentMethodDisplay = () => {
    if (isCod) {
      return {
        label: 'Cash on Delivery (COD)',
        detail: 'Pay upon delivery at doorstep',
        icon: Banknote,
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      };
    }
    if (isUpi) {
      return {
        label: 'UPI / Digital Wallet',
        detail: lastConfirmedOrder.paymentDetails?.upiId || 'Verified UPI Address',
        icon: Smartphone,
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      };
    }
    if (isNetBanking) {
      return {
        label: 'Net Banking',
        detail: lastConfirmedOrder.paymentDetails?.bankName || 'Direct Bank Portal',
        icon: Landmark,
        badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      };
    }
    return {
      label: 'Stripe Card (Test Mode)',
      detail: lastConfirmedOrder.paymentDetails?.cardLast4
        ? `•••• •••• •••• ${lastConfirmedOrder.paymentDetails.cardLast4}`
        : '•••• 4242',
      icon: CreditCard,
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    };
  };

  const paymentDisplay = getPaymentMethodDisplay();
  const PaymentIcon = paymentDisplay.icon;

  const shippingMethod = lastConfirmedOrder.shippingAddress?.shippingMethod;
  const shippingLabel =
    shippingMethod === 'express'
      ? '⚡ Express Delivery (1-2 Days)'
      : shippingMethod === 'overnight'
      ? '🚀 Priority Overnight (Next-Day)'
      : '🚚 Standard Shipping (3-5 Days)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setLastConfirmedOrder(null)}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 my-auto">
        <button
          onClick={() => setLastConfirmedOrder(null)}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7 text-center overflow-y-auto flex-1">
          {/* Animated Badge */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-3 animate-bounce">
            <PackageCheck className="h-7 w-7" />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isCod
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {isCod ? 'Order Placed • Waiting For Delivery Confirmation' : 'Payment Confirmed • Test Sandbox'}
          </span>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Thank You for Your Order!
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Order <strong className="font-mono text-zinc-800 dark:text-zinc-200">{lastConfirmedOrder.orderNumber}</strong> has been created and real-time inventory has been reserved.
          </p>

          {/* Customer & Shipping Summary Card */}
          <div className="mt-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-3">
            {/* Top row: Customer, Contact & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-700/60">
              {/* Shipping Address Details */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-indigo-500" /> Deliver to
                </span>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {lastConfirmedOrder.customerName}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                  {lastConfirmedOrder.shippingAddress.street}
                  {lastConfirmedOrder.shippingAddress.apartment ? `, ${lastConfirmedOrder.shippingAddress.apartment}` : ''}
                </p>
                <p className="text-zinc-500 text-[11px]">
                  {lastConfirmedOrder.shippingAddress.city}, {lastConfirmedOrder.shippingAddress.state} {lastConfirmedOrder.shippingAddress.postalCode}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 pt-0.5">
                  <Phone className="h-3 w-3 text-zinc-400" />
                  <span>{lastConfirmedOrder.customerPhone || lastConfirmedOrder.shippingAddress.phone || 'Phone verified'}</span>
                </div>
              </div>

              {/* Payment & Delivery Speed */}
              <div className="space-y-1.5 sm:border-l sm:border-zinc-200/60 sm:pl-3 dark:border-zinc-700/60">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block flex items-center gap-1">
                    <PaymentIcon className="h-3 w-3 text-indigo-500" /> Payment Method
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${paymentDisplay.badgeBg}`}>
                      {paymentDisplay.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                    {paymentDisplay.detail}
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block flex items-center gap-1">
                    <Truck className="h-3 w-3 text-indigo-500" /> Delivery Speed
                  </span>
                  <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {shippingLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery instructions note */}
            {lastConfirmedOrder.shippingAddress.deliveryNotes && (
              <div className="flex items-start gap-1.5 text-[11px] text-zinc-500 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                <FileText className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Delivery Notes:</strong> {lastConfirmedOrder.shippingAddress.deliveryNotes}
                </span>
              </div>
            )}

            {/* Items Purchased List */}
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {lastConfirmedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-700">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="line-clamp-1 font-bold text-zinc-800 dark:text-zinc-200">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-zinc-200/60 pt-2 flex justify-between font-bold text-zinc-900 dark:text-white dark:border-zinc-700/60">
              <span>{isCod ? 'Total Payable on Delivery' : 'Total Amount Paid'}</span>
              <span className="text-base text-indigo-600 dark:text-indigo-400">
                ${lastConfirmedOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Automated Bill / Tax Invoice Action Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 dark:bg-indigo-950/40 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Automated Customer Invoice Generated
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase">
                    Ready
                  </span>
                </p>
                <p className="text-[10px] text-zinc-500">
                  Official commercial bill with tax breakdown, QR verification & instant PDF print
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveInvoiceOrder(lastConfirmedOrder);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <Printer className="h-4 w-4" />
              <span>View & Print Bill</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/orders"
              onClick={() => setLastConfirmedOrder(null)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-400 dark:hover:text-white transition-colors"
            >
              Track in Orders <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setLastConfirmedOrder(null)}
              className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

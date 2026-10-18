'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  X,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  FileText,
  QrCode,
  ShieldCheck,
  Building,
  Phone,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
} from 'lucide-react';

export default function InvoiceModal() {
  const { activeInvoiceOrder, setActiveInvoiceOrder } = useCart();
  const [emailSent, setEmailSent] = useState(false);

  if (!activeInvoiceOrder) return null;

  const order = activeInvoiceOrder;
  const isCod = order.paymentMethod === 'cod';
  const invoiceNumber = `INV-2026-${order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '9281'}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const invoiceContent = document.getElementById('printable-invoice')?.innerHTML;
    if (!invoiceContent) return;

    const htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vendra_Invoice_${invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { background-color: #f8fafc; font-weight: 700; }
            .stamp { border: 2px dashed #059669; color: #059669; padding: 4px 10px; font-weight: 800; display: inline-block; border-radius: 4px; }
            .stamp-cod { border: 2px dashed #d97706; color: #d97706; }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `;

    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vendra_Invoice_${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmailInvoice = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3500);
  };

  const getPaymentLabel = () => {
    if (order.paymentMethod === 'cod') return 'Cash on Delivery (COD)';
    if (order.paymentMethod === 'upi') return `UPI (${order.paymentDetails?.upiId || 'Wallet'})`;
    if (order.paymentMethod === 'net_banking') return `Net Banking (${order.paymentDetails?.bankName || 'Direct'})`;
    return `Stripe Card (${order.paymentDetails?.cardLast4 ? `•••• ${order.paymentDetails.cardLast4}` : '•••• 4242'})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity no-print"
        onClick={() => setActiveInvoiceOrder(null)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-3xl max-h-[95vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden during printing) */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-800/60 no-print gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Official Commercial Invoice
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {invoiceNumber} • {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emailSent && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sent to {order.customerEmail}!
              </span>
            )}

            <button
              onClick={handleEmailInvoice}
              title="Email invoice copy"
              className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Email Copy</span>
            </button>

            <button
              onClick={handleDownload}
              title="Download invoice file"
              className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={() => setActiveInvoiceOrder(null)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-white text-zinc-900" id="printable-invoice">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-zinc-200 gap-4">
            {/* Brand details */}
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-amber-500/10 p-1 border border-amber-200/50">
                <Image
                  src="/vendra-logo.png"
                  alt="Vendra Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 uppercase">
                  Vendra
                </h1>
                <p className="text-xs font-bold text-indigo-600">
                  Vendra Retail & E-Commerce Technologies Inc.
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  100 Innovation Plaza, Suite 400 • Silicon Bay, CA 94025
                </p>
                <p className="text-[10px] text-zinc-400">
                  EIN: 94-8192837 • GST/VAT Reg: 27AABCU9603R1ZM • support@vendra.com
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="sm:text-right space-y-1">
              <span className="inline-block rounded-md bg-zinc-900 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                TAX INVOICE / RECEIPT
              </span>
              <div className="font-mono text-base font-extrabold text-zinc-900">
                {invoiceNumber}
              </div>
              <p className="text-[11px] text-zinc-500">
                Order Ref: <strong className="font-mono text-zinc-800">{order.orderNumber}</strong>
              </p>
              <p className="text-[11px] text-zinc-500">
                Issued: {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>

          {/* Payment Stamp & Transaction ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-5 py-3 px-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center gap-2">
              <div
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border-2 ${
                  isCod
                    ? 'border-amber-600 text-amber-700 bg-amber-50/60'
                    : 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                }`}
              >
                {isCod ? 'PAYMENT DUE UPON DELIVERY' : 'PAID IN FULL • VERIFIED TRANSACTION'}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                via {getPaymentLabel()}
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono">
              Txn Ref: <span className="font-bold text-zinc-800">{order.paymentId || 'AUTHTEST-9821'}</span>
            </div>
          </div>

          {/* Customer & Shipping Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 text-xs border-b border-zinc-200">
            {/* Bill To */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Billed To (Customer Details)
              </span>
              <p className="font-extrabold text-sm text-zinc-900">{order.customerName}</p>
              <p className="text-zinc-600">{order.customerEmail}</p>
              {(order.customerPhone || order.shippingAddress.phone) && (
                <p className="text-zinc-600 font-medium">
                  📞 {order.customerPhone || order.shippingAddress.phone}
                </p>
              )}
            </div>

            {/* Ship To */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Shipped To (Delivery Destination)
              </span>
              <p className="font-bold text-zinc-800">
                {order.shippingAddress.street}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}
              </p>
              <p className="text-zinc-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <p className="text-[11px] font-semibold text-indigo-600 pt-0.5">
                Speed:{' '}
                {order.shippingAddress.shippingMethod === 'express'
                  ? '⚡ Express Delivery (1-2 Days)'
                  : order.shippingAddress.shippingMethod === 'overnight'
                  ? '🚀 Priority Overnight (Next-Day)'
                  : '🚚 Standard Shipping (3-5 Days)'}
              </p>
              {order.shippingAddress.deliveryNotes && (
                <p className="text-[10px] text-zinc-500 italic">
                  Notes: &quot;{order.shippingAddress.deliveryNotes}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 bg-zinc-100/70 text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-3 font-mono text-zinc-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{item.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            SKU: {item.productId.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-700">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-zinc-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-zinc-200 gap-6">
            {/* Left side: Notes, Terms, QR */}
            <div className="space-y-3 max-w-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <QrCode className="h-10 w-10 text-zinc-800 flex-shrink-0" />
                <div className="text-[10px] text-zinc-500 leading-tight">
                  <strong className="text-zinc-800 block mb-0.5">Automated Digital Verification</strong>
                  Scan to verify order validity against Vendra Central Ledger. Generated automatically upon payment confirmation.
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed">
                * All prices are in USD ($). This is a computer-generated tax bill of supply and does not require a physical signature under E-Commerce Regulations.
              </p>
            </div>

            {/* Right side: Summary calculations */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal:</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping & Handling:</span>
                <span className="font-mono">
                  {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Applied Discount:</span>
                  <span className="font-mono">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Taxes & GST (Included):</span>
                <span className="font-mono">${(order.total * 0.08).toFixed(2)}</span>
              </div>

              <div className="border-t-2 border-zinc-900 pt-2 flex justify-between items-center text-sm font-black text-zinc-900">
                <span>{isCod ? 'Total Payable:' : 'Total Paid:'}</span>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div className="mt-8 pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
            <div>
              Generated automatically by <strong>Vendra Automated Billing Engine v2.4</strong>
            </div>
            <div className="text-right">
              <span className="font-bold text-zinc-700 block">Vendra Retail Technologies Inc.</span>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

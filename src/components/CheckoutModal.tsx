'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod } from '@/lib/types';
import {
  X,
  CreditCard,
  Lock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Truck,
  Phone,
  Mail,
  User,
  MapPin,
  Building,
  FileText,
  Smartphone,
  Banknote,
  Landmark,
  Zap,
  Check,
  QrCode,
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    items,
    subtotal,
    discount,
    clearCart,
    setLastConfirmedOrder,
  } = useCart();
  const { user } = useAuth();

  // Customer Contact
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 382-9014');

  // Shipping Address
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [apartment, setApartment] = useState('Apt 4B');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');
  const [deliveryNotes, setDeliveryNotes] = useState('Leave on the front porch if not answering');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_test');

  // Stripe Card Details
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardZip, setCardZip] = useState('97477');

  // UPI Details
  const [upiId, setUpiId] = useState('alex.mercer@okhdfcbank');

  // Net Banking Details
  const [selectedBank, setSelectedBank] = useState('Chase Bank');

  // COD Acceptance
  const [codAccepted, setCodAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Shipping Fee Calculation
  const baseShippingFee = subtotal >= 150 ? 0 : 15;
  const shippingSurcharge = shippingMethod === 'express' ? 10 : shippingMethod === 'overnight' ? 25 : 0;
  const totalShippingFee = baseShippingFee + shippingSurcharge;
  const finalTotal = Math.max(0, subtotal + totalShippingFee - discount);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
    } else {
      if (!customerName) setCustomerName('Alex Mercer');
      if (!customerEmail) setCustomerEmail('user@store.com');
    }
  }, [user]);

  if (!isCheckoutOpen) return null;

  const handleFillSuccessCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExp('12/28');
    setCardCvc('123');
    setPaymentMethod('stripe_test');
    setErrorMsg(null);
  };

  const handleFillDeclineCard = () => {
    setCardNumber('4000 0000 0000 0002');
    setCardExp('12/28');
    setCardCvc('123');
    setPaymentMethod('stripe_test');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg('Please provide your full customer name and email address.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Please enter a valid phone number for shipping updates.');
      return;
    }

    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMsg('Please complete all required shipping address fields.');
      return;
    }

    // Payment method validation
    let paymentDetails: Record<string, string> | undefined = undefined;

    if (paymentMethod === 'stripe_test' || paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 16) {
        setErrorMsg('Please enter a valid 16-digit card number or click "Autofill Test Card".');
        return;
      }
      paymentDetails = {
        cardBrand: 'Visa (Stripe Test)',
        cardLast4: cleanCard.slice(-4),
      };
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. yourname@upi or user@okhdfcbank).');
        return;
      }
      paymentDetails = {
        upiId: upiId.trim(),
      };
    } else if (paymentMethod === 'net_banking') {
      if (!selectedBank) {
        setErrorMsg('Please select your preferred Net Banking institution.');
        return;
      }
      paymentDetails = {
        bankName: selectedBank,
      };
    } else if (paymentMethod === 'cod') {
      if (!codAccepted) {
        setErrorMsg('Please confirm you will pay upon delivery.');
        return;
      }
      paymentDetails = {
        bankName: 'Cash / Card on Delivery',
      };
    }

    setLoading(true);

    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.product._id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.image,
        })),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: {
          street: street.trim(),
          apartment: apartment.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          phone: customerPhone.trim(),
          deliveryNotes: deliveryNotes.trim(),
          shippingMethod,
        },
        shippingFee: totalShippingFee,
        discount,
        paymentMethod,
        paymentDetails,
        testCardNumber: (paymentMethod === 'stripe_test' || paymentMethod === 'card') ? cardNumber : undefined,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Success! Clear cart, close checkout, trigger confirmation receipt
      clearCart();
      setIsCheckoutOpen(false);
      setLastConfirmedOrder(data.order);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                Checkout & Shipping
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Instant Simulation
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500">
                Customer delivery information & multiple payment methods
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && setIsCheckoutOpen(false)}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= SECTION 1: CUSTOMER CONTACT & SHIPPING DETAILS ================= */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                1. Customer & Shipping Details
              </h3>
              <span className="text-[11px] text-zinc-400">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="Alex Mercer"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address (Receipt & Tracking) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="alex@store.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number (Delivery SMS / Calls) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="+1 (555) 382-9014"
                  />
                </div>
              </div>

              {/* Apartment / Suite */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Apartment, Suite, Unit, Floor
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="Apt 4B / Floor 3"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="742 Evergreen Terrace"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                  placeholder="Springfield"
                />
              </div>

              {/* State & Zip */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="OR"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Postal Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                    placeholder="97477"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                  placeholder="United States"
                />
              </div>

              {/* Delivery Speed / Shipping Method */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-indigo-500" />
                  Choose Delivery Speed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Standard */}
                  <label
                    onClick={() => setShippingMethod('standard')}
                    className={`cursor-pointer rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">
                        Standard
                      </span>
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        {baseShippingFee === 0 ? 'FREE' : `$${baseShippingFee}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1">3 - 5 Business Days</span>
                  </label>

                  {/* Express */}
                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`cursor-pointer rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                      shippingMethod === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" /> Express
                      </span>
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        + $10.00
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1">1 - 2 Business Days</span>
                  </label>

                  {/* Overnight */}
                  <label
                    onClick={() => setShippingMethod('overnight')}
                    className={`cursor-pointer rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                      shippingMethod === 'overnight'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                        : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-500" /> Overnight
                      </span>
                      <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                        + $25.00
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1">Next-day by 10:30 AM</span>
                  </label>
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  Delivery Instructions / Doorbell Notes (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white text-xs"
                  placeholder="e.g. Leave at front porch, ring buzzer #4..."
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: PAYMENT METHODS ================= */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                2. Select Payment Method
              </h3>
              <span className="text-[11px] text-zinc-400">Step 2 of 2</span>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Option 1: Stripe Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe_test')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  paymentMethod === 'stripe_test' || paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white font-bold'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                }`}
              >
                <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs">Stripe Card</span>
                <span className="text-[9px] text-indigo-600/80 dark:text-indigo-300 font-mono">
                  Test Card
                </span>
              </button>

              {/* Option 2: UPI / Digital Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white font-bold'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                }`}
              >
                <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs">UPI / Wallet</span>
                <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400 font-mono">
                  GPay / PhonePe
                </span>
              </button>

              {/* Option 3: Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white font-bold'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                }`}
              >
                <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs">Cash on Delivery</span>
                <span className="text-[9px] text-amber-600/80 dark:text-amber-400 font-mono">
                  Pay at door
                </span>
              </button>

              {/* Option 4: Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                  paymentMethod === 'net_banking'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white font-bold'
                    : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                }`}
              >
                <Landmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs">Net Banking</span>
                <span className="text-[9px] text-purple-600/80 dark:text-purple-400 font-mono">
                  Direct Bank
                </span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Stripe Test Card */}
            {(paymentMethod === 'stripe_test' || paymentMethod === 'card') && (
              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Stripe Card Simulation</span>
                  </div>

                  {/* Autofill buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleFillSuccessCard}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Autofill Test Card
                    </button>
                    <button
                      type="button"
                      onClick={handleFillDeclineCard}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      Test Decline
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      16-Digit Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-zinc-900 font-mono tracking-wider focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="12/28"
                        className="w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-zinc-900 font-mono text-center focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-zinc-900 font-mono text-center focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Billing ZIP
                      </label>
                      <input
                        type="text"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        placeholder="97477"
                        className="w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-zinc-900 font-mono text-center focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. UPI / Digital Wallet */}
            {paymentMethod === 'upi' && (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Instant UPI & Mobile Wallet</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                    Zero Surcharge
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-zinc-900 font-mono focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-zinc-400">Quick handles:</span>
                    {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm'].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setUpiId(`alex.mercer${h}`)}
                        className="rounded-md border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 dark:bg-zinc-800 dark:border-emerald-800 dark:text-emerald-300"
                      >
                        {h}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white p-3 border border-emerald-100 dark:bg-zinc-800 dark:border-emerald-900/40 text-[11px] text-zinc-600 dark:text-zinc-300">
                    <QrCode className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-100">
                        Scan to Pay or Instant VPA Trigger
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        A payment request will be simulated directly to your UPI app for instantaneous approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. Cash on Delivery */}
            {paymentMethod === 'cod' && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                    <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Doorstep Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                    Pay When Delivered
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-amber-100 dark:bg-zinc-800 dark:border-amber-900/40 space-y-2 text-xs">
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                    💵 You can pay with cash or swipe your debit/credit card with the delivery courier upon receiving your parcel at{' '}
                    <strong>{street || 'your delivery address'}</strong>.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={codAccepted}
                      onChange={(e) => setCodAccepted(e.target.checked)}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                      I agree to be present at delivery location and pay ${finalTotal.toFixed(2)}.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. Net Banking */}
            {paymentMethod === 'net_banking' && (
              <div className="rounded-2xl border border-purple-200/80 bg-purple-50/40 p-4 dark:border-purple-900/40 dark:bg-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-200">
                    <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Direct Net Banking</span>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold">
                    All Major Banks
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs font-semibold text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="Chase Bank">Chase Bank</option>
                    <option value="Bank of America">Bank of America</option>
                    <option value="Wells Fargo">Wells Fargo</option>
                    <option value="Citibank">Citibank</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Barclays">Barclays</option>
                    <option value="HSBC Global">HSBC Global</option>
                  </select>
                  <p className="text-[10px] text-zinc-400">
                    You will be seamlessly verified through your bank&apos;s encrypted tokenized gateway simulation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= ORDER SUMMARY & ACTION BUTTON ================= */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-4 border border-zinc-200/70 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Items Subtotal ({items.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>
                Shipping ({shippingMethod === 'express' ? 'Express 1-2 Days' : shippingMethod === 'overnight' ? 'Overnight Priority' : 'Standard 3-5 Days'})
              </span>
              <span>{totalShippingFee === 0 ? 'FREE' : `$${totalShippingFee.toFixed(2)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between items-center text-sm font-extrabold text-zinc-900 dark:text-white">
              <span>Final Total</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-xs font-extrabold text-white shadow-xl hover:bg-indigo-600 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authorizing Payment & Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {paymentMethod === 'cod'
                    ? `Confirm Cash on Delivery Order ($${finalTotal.toFixed(2)})`
                    : `Authorize & Place Order ($${finalTotal.toFixed(2)})`}
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-zinc-400 mt-2">
              🔒 256-Bit SSL Encrypted • Zero Risk Test Sandbox • Inventory Adjusted Real-Time
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

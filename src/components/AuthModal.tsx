'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, UserCheck, Lock, Mail, User, Sparkles, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, quickLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Login failed');
        }
      } else {
        const res = await register(name, email, password, role);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Registration failed');
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (selectedRole: 'admin' | 'customer') => {
    setLoading(true);
    await quickLogin(selectedRole);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Tabs */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Storefront & Admin Access
              </h2>
              <p className="text-[11px] text-zinc-500">Select role or login with credentials</p>
            </div>
          </div>

          {/* Quick Demo Logins Bar */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/30 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                ⚡ 1-Click Demo Profiles
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuick('admin')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 px-3 font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuick('customer')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 px-3 font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                Customer Demo
              </button>
            </div>
            <p className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
              Admin: admin@store.com | Customer: user@store.com
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800 text-xs font-semibold">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 transition-all ${
                tab === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 transition-all ${
                tab === 'register'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-2.5 text-red-600 font-semibold dark:bg-red-950/40 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-white"
              >
                <option value="customer">Customer (Storefront Shopper)</option>
                <option value="admin">Administrator (Full Dashboard Control)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 font-bold text-white shadow-md hover:bg-indigo-600 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-400 dark:hover:text-white transition-all mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

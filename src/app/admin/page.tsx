'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminProductModal from '@/components/AdminProductModal';
import { useAuth } from '@/context/AuthContext';
import { IProduct, IOrder, OrderStatus } from '@/lib/types';
import { CATEGORIES } from '@/lib/initialData';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Package,
  Layers,
  Tag,
  PlusCircle,
  Megaphone,
  Ticket,
  Image as ImageIcon,
  Tv,
  Wallet,
  ShieldCheck,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  RotateCw,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Filter,
  Sparkles,
  LogOut,
  Check,
  ShoppingCart,
  RefreshCw,
  X,
  CreditCard,
  Clock,
  ChevronDown,
  Globe,
  Bell,
  Menu,
  Printer,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

type AdminTab =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'items'
  | 'categories'
  | 'coupons'
  | 'reports';

interface ICoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  status: 'active' | 'expired';
  usedCount: number;
}

export default function AdminPage() {
  const { user, quickLogin, logout } = useAuth();
  const { setActiveInvoiceOrder } = useCart();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Stats
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  }>({
    totalRevenue: 2968.9,
    totalOrders: 142,
    pendingOrders: 15,
    totalProducts: 48,
    lowStockCount: 6,
    outOfStockCount: 2,
  });

  // Products
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<IProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IOrder | null>(null);

  // POS State
  const [posCart, setPosCart] = useState<{ product: IProduct; qty: number }[]>([]);
  const [posCustomerName, setPosCustomerName] = useState('Walk-in Customer');
  const [posSuccessMsg, setPosSuccessMsg] = useState<string | null>(null);

  // Coupons
  const [coupons, setCoupons] = useState<ICoupon[]>([
    { id: 'cp-1', code: 'VENDRA10', discountType: 'percentage', discountValue: 10, minSpend: 50, status: 'active', usedCount: 38 },
    { id: 'cp-2', code: 'SUPER20', discountType: 'fixed', discountValue: 20, minSpend: 100, status: 'active', usedCount: 14 },
    { id: 'cp-3', code: 'VIP50', discountType: 'fixed', discountValue: 50, minSpend: 250, status: 'active', usedCount: 7 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);

  // Hover state for chart bar tooltip
  const [hoveredBar, setHoveredBar] = useState<{ day: number; earn: number; comm: number } | null>(null);

  // Dynamic Date Range Filter
  const [dateRangeLabel, setDateRangeLabel] = useState('Oct 01, 2026 - Oct 31, 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-10-31');

  const handleSelectDatePreset = (label: string, start: string, end: string) => {
    setDateRangeLabel(label);
    setCustomStartDate(start);
    setCustomEndDate(end);
    setIsDatePickerOpen(false);
    setStatusMsg({ text: `Date filter updated to ${label}` });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleApplyCustomDateRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStartDate || !customEndDate) return;
    const startObj = new Date(customStartDate);
    const endObj = new Date(customEndDate);
    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
    const label = `${startObj.toLocaleDateString('en-US', formatOpts)} - ${endObj.toLocaleDateString('en-US', formatOpts)}`;
    setDateRangeLabel(label);
    setIsDatePickerOpen(false);
    setStatusMsg({ text: `Date filter set to ${label}` });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products);
      }

      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrders(orderData.orders);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Inventory Stock Adjustment
  const handleStockUpdate = async (productId: string, delta: number) => {
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.stock + delta);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
        );
        setStatusMsg({ text: `Updated stock of "${prod.name}" to ${newStock} units.` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch {
      setStatusMsg({ text: 'Failed to update stock', error: true });
    }
  };

  // Product Delete
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setStatusMsg({ text: `Product "${name}" deleted.` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch {
      setStatusMsg({ text: 'Failed to delete product', error: true });
    }
  };

  // Order Status Change
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        setStatusMsg({ text: `Order status set to "${newStatus.toUpperCase()}".` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch {
      setStatusMsg({ text: 'Failed to update order status', error: true });
    }
  };

  // POS Add to Cart
  const handleAddToPos = (product: IProduct) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  // POS Submit Sale
  const handleCompletePosSale = async () => {
    if (!posCart.length) return;
    try {
      const items = posCart.map((it) => ({
        productId: it.product._id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.qty,
        image: it.product.image,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerName: posCustomerName || 'Walk-in Cashier Guest',
          customerEmail: 'cashier@vendra.store',
          shippingAddress: {
            street: 'Store POS Counter #1',
            city: 'Metro Mall',
            state: 'NY',
            postalCode: '10001',
            country: 'United States',
          },
          discount: 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPosSuccessMsg(`Sale complete! Receipt #${data.order.orderNumber} recorded.`);
        setPosCart([]);
        fetchDashboardData();
        setTimeout(() => setPosSuccessMsg(null), 4000);
      }
    } catch {
      alert('Failed to process POS sale');
    }
  };

  // Coupon Creation
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newCoupon: ICoupon = {
      id: `cp-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: 'percentage',
      discountValue: Number(newCouponDiscount),
      minSpend: 50,
      status: 'active',
      usedCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    setNewCouponCode('');
    setStatusMsg({ text: `Created coupon code ${newCoupon.code}` });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // 31 Days Daily Chart Data (Days 1 to 31)
  const chartDays = useMemo(() => {
    // Generate realistic daily data matching the screenshot
    const data = [];
    const baseEarnPattern = [
      1200, 1850, 1100, 2200, 1400, 950, 1600, 800, 1950, 1300, 
      1750, 1200, 2400, 1500, 1100, 1900, 1350, 2600, 1800, 1400, 
      2100, 1250, 1600, 2450, 1300, 1850, 2200, 1500, 1900, 1150, 2100
    ];
    for (let day = 1; day <= 31; day++) {
      const earn = baseEarnPattern[day - 1];
      const comm = Math.round(earn * 0.13);
      data.push({ day, earn, comm });
    }
    return data;
  }, []);

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory =
      productCategoryFilter === 'All' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchSearch && matchCategory;
  });

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus =
      orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  // Top products from catalog matching the screenshot
  const topSellingList = [
    {
      id: 'prod-apple-watch-7',
      name: 'Apple Watch Series 7',
      category: 'Electronics',
      price: 399,
      sold: 52,
      profit: 49,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-macbook-pro-m1',
      name: 'MacBook Pro M1',
      category: 'Electronics',
      price: 1249,
      sold: 24,
      profit: 160,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-dell-inspiron-15',
      name: 'Dell Inspiron 15',
      category: 'Electronics',
      price: 442,
      sold: 54,
      profit: 187,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-hp-probook-450',
      name: 'HP Probook 450',
      category: 'Electronics',
      price: 499,
      sold: 72,
      profit: 92,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const topRatedList = [
    {
      id: 'prod-apple-watch-7',
      name: 'Apple Watch Series 7',
      category: 'Electronics',
      price: 399,
      rating: 5,
      reviews: 18,
      profit: 49,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-macbook-pro-m1',
      name: 'MacBook Pro M1',
      category: 'Electronics',
      price: 1249,
      rating: 5,
      reviews: 24,
      profit: 160,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-dell-inspiron-15',
      name: 'Dell Inspiron 15',
      category: 'Electronics',
      price: 442,
      rating: 5,
      reviews: 15,
      profit: 187,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-hp-probook-450',
      name: 'HP Probook 450',
      category: 'Electronics',
      price: 499,
      rating: 5,
      reviews: 32,
      profit: 92,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* ===================== SIDEBAR ===================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111827] text-slate-400 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-white p-0.5 shadow-md">
              <Image src="/vendra-logo.png" alt="Vendra Logo" fill className="object-contain" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-white">Ven</span>
              <span className="text-xl font-black tracking-tight text-orange-400">dra</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-xs font-semibold custom-scrollbar">
          {/* DASHBOARD SECTION */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Dashboard
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* POINT OF SALE */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Point of Sale
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('pos');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'pos'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Store className="h-4 w-4" />
                <span>POS</span>
                <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  Live
                </span>
              </button>
            </div>
          </div>

          {/* ORDER MANAGEMENT */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Order Management
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
                <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">
                  {orders.length || 85}
                </span>
              </button>
            </div>
          </div>

          {/* ITEM MANAGEMENT */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Item Management
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('items');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'items'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Items</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('categories');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Categories</span>
              </button>
            </div>
          </div>

          {/* MARKETING SECTION */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Marketing Section
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('coupons');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'coupons'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>Coupons</span>
              </button>
            </div>
          </div>

          {/* REPORTS */}
          <div>
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Reports
            </div>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-[#00a389] text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Sales Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d131f] space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#00a389]" />
            <span>View Customer Storefront</span>
          </Link>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#00a389] flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
              <div>
                <p className="text-white font-semibold text-[11px] leading-tight">Admin Demo</p>
                <p className="text-[10px] text-slate-400">admin@store.com</p>
              </div>
            </div>
            <button
              onClick={() => quickLogin(user?.role === 'admin' ? 'customer' : 'admin')}
              className="text-[10px] text-emerald-400 hover:underline"
              title="Toggle role"
            >
              {user?.role === 'admin' ? 'Role: Admin' : 'Switch Role'}
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Box */}
            <div className="relative w-64 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Type to search..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00a389] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Store Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store Live</span>
            </div>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
              <span>🇬🇧</span>
              <span>EN</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <Bell className="h-4 w-4" />
              </button>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00a389] text-[9px] font-bold text-white">
                3
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
              <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-emerald-500/30">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Admin Avatar"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">Cynthia Littleidge</p>
                <p className="text-[10px] text-slate-400 font-medium">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-Header Notice if Not logged in as Admin */}
        {user?.role !== 'admin' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>
                Demonstration Mode: You are viewing with standard credentials. Click quick login to activate full Admin rights.
              </span>
            </div>
            <button
              onClick={() => quickLogin('admin')}
              className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
            >
              Log In as Super Admin
            </button>
          </div>
        )}

        {/* Global Toast */}
        {statusMsg && (
          <div
            className={`fixed top-20 right-6 z-50 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition-all ${
              statusMsg.error
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : 'bg-emerald-600 text-white shadow-emerald-600/20'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {/* ==================== TAB: DASHBOARD (MATCHING SCREENSHOT) ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Breadcrumbs & Date Range Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    dashboard / <span className="text-[#00a389] font-medium">Dashboard</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Interactive Date Range Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-[#00a389] hover:bg-slate-50 transition-colors"
                      title="Click to change date range"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#00a389]" />
                      <span>{dateRangeLabel}</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>

                    {isDatePickerOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Select Date Range</span>
                          <button
                            onClick={() => setIsDatePickerOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="py-2 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Quick Presets
                          </span>
                          {[
                            { label: 'Current Month (Oct 2026)', start: '2026-10-01', end: '2026-10-31', display: 'Oct 01, 2026 - Oct 31, 2026' },
                            { label: 'Last 30 Days (Rolling)', start: '2026-09-18', end: '2026-10-18', display: 'Sep 18, 2026 - Oct 18, 2026' },
                            { label: 'Last Month (Sep 2026)', start: '2026-09-01', end: '2026-09-30', display: 'Sep 01, 2026 - Sep 30, 2026' },
                            { label: 'This Quarter (Q4 2026)', start: '2026-10-01', end: '2026-12-31', display: 'Oct 01, 2026 - Dec 31, 2026' },
                            { label: 'Year to Date (2026)', start: '2026-01-01', end: '2026-10-18', display: 'Jan 01, 2026 - Oct 18, 2026' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleSelectDatePreset(preset.display, preset.start, preset.end)}
                              className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                dateRangeLabel === preset.display
                                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Date Inputs */}
                        <form onSubmit={handleApplyCustomDateRange} className="border-t border-slate-100 pt-3 mt-1 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Custom Dates
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Start Date</label>
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#00a389]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">End Date</label>
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#00a389]"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full mt-2 rounded-xl bg-[#00a389] py-1.5 text-xs font-bold text-white hover:bg-[#008f77] transition-colors"
                          >
                            Apply Custom Range
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as 'monthly')}
                      className="bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    title="Refresh data"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#00a389] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#008f77] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Product
                  </button>
                </div>
              </div>

              {/* 10 PASTEL METRIC STAT CARDS (2 ROWS X 5 COLS - EXACT MATCH TO IMAGE) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* Row 1, Card 1: Total Earning */}
                <div className="rounded-2xl border border-[#c8eedf] bg-[#eef9f5] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Total Earning</span>
                    <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100/60 rounded px-1">
                      ↑ 12%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    $ 2,968.90
                  </div>
                </div>

                {/* Row 1, Card 2: Commission Given */}
                <div className="rounded-2xl border border-[#c6edf7] bg-[#eef8fb] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Commission Given</span>
                    <span className="flex items-center text-[10px] font-bold text-teal-600 bg-teal-100/60 rounded px-1">
                      ↑ 8%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    $ 390.66
                  </div>
                </div>

                {/* Row 1, Card 3: Total Item */}
                <div className="rounded-2xl border border-[#fedec8] bg-[#fff5ee] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Total Item</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    2600
                  </div>
                </div>

                {/* Row 1, Card 4: In Stock */}
                <div className="rounded-2xl border border-[#cbf3d9] bg-[#f0fbf4] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">In Stock</span>
                    <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100/60 rounded px-1">
                      ↑ 5%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    18.6K
                  </div>
                </div>

                {/* Row 1, Card 5: Out Of Stock */}
                <div className="rounded-2xl border border-[#fecdd3] bg-[#fff0f2] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Out Of Stock</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
                    190
                  </div>
                </div>

                {/* Row 2, Card 6: Waiting For Confirmation */}
                <div className="rounded-2xl border border-[#fef08a] bg-[#fffbe8] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Waiting For Confirmation</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                    15
                  </div>
                </div>

                {/* Row 2, Card 7: Processing Order */}
                <div className="rounded-2xl border border-[#bae6fd] bg-[#f0f7ff] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Processing Order</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-sky-700 tracking-tight">
                    70
                  </div>
                </div>

                {/* Row 2, Card 8: Ready For Delivery */}
                <div className="rounded-2xl border border-[#fde047] bg-[#fefce8] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Ready For Delivery</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-yellow-700 tracking-tight">
                    42
                  </div>
                </div>

                {/* Row 2, Card 9: Delivered Items */}
                <div className="rounded-2xl border border-[#99f6e4] bg-[#f0fdfa] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Delivered Items</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-teal-700 tracking-tight">
                    15K
                  </div>
                </div>

                {/* Row 2, Card 10: Refunded */}
                <div className="rounded-2xl border border-[#fbcfe8] bg-[#fdf2f8] p-4 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="text-[11px] font-medium text-slate-600">Refunded</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-pink-700 tracking-tight">
                    $ 580.00
                  </div>
                </div>
              </div>

              {/* EARNING AND COMMISSION DUAL-BAR CHART */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Earning and Commission
                    </h2>
                    <p className="text-xs text-slate-400">
                      Active period: {dateRangeLabel} ({timeframe})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#2563eb] shrink-0" />
                      <span className="text-slate-700">Total earning $ 2,968.90</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#93c5fd] shrink-0" />
                      <span className="text-slate-500">Commission given $ 390.66</span>
                    </div>
                  </div>
                </div>

                {/* Tooltip Card if hovering or tapping */}
                <div className="flex items-center justify-between min-h-[26px] text-xs font-semibold text-slate-600 mb-2">
                  <div>
                    {hoveredBar ? (
                      <span className="inline-flex items-center gap-2 bg-slate-100 rounded-lg px-2.5 py-1 text-[11px]">
                        <span>Day {hoveredBar.day}:</span>
                        <strong className="text-blue-600">Earning ${hoveredBar.earn}</strong>
                        <span className="text-slate-400">•</span>
                        <span className="text-sky-500">Commission ${hoveredBar.comm}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Tap or hover bar for breakdown</span>
                    )}
                  </div>
                  <span className="md:hidden text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    Scroll ↔
                  </span>
                </div>

                {/* SVG / CSS Bar Chart */}
                <div className="relative pt-2">
                  <div className="flex">
                    {/* Fixed Y-Axis Labels on Left */}
                    <div className="flex flex-col justify-between pb-7 pr-2.5 text-[10px] text-slate-400 font-medium select-none shrink-0 h-48">
                      <span>3000</span>
                      <span>2000</span>
                      <span>1000</span>
                      <span>0</span>
                    </div>

                    {/* Scrollable Chart Area (Mobile swipeable, Desktop full-width) */}
                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                      <div className="relative min-w-[620px] md:min-w-full h-48">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                          <div className="border-b border-dashed border-slate-100 w-full" />
                          <div className="border-b border-dashed border-slate-100 w-full" />
                          <div className="border-b border-dashed border-slate-100 w-full" />
                          <div className="border-b border-slate-200 w-full" />
                        </div>

                        {/* Bars Container */}
                        <div className="relative flex items-end justify-between h-full pr-1">
                          {chartDays.map((item) => {
                            const earnHeightPercent = Math.min(100, Math.max(10, (item.earn / 3000) * 100));
                            const commHeightPercent = Math.min(100, Math.max(5, (item.comm / 3000) * 100));
                            const isHovered = hoveredBar?.day === item.day;

                            return (
                              <div
                                key={item.day}
                                onMouseEnter={() => setHoveredBar(item)}
                                onMouseLeave={() => setHoveredBar(null)}
                                onClick={() => setHoveredBar(isHovered ? null : item)}
                                className="group relative flex flex-col items-center justify-end h-full flex-1 cursor-pointer mx-0.5 pb-0"
                              >
                                {/* Dual Bars */}
                                <div className="flex items-end gap-[2px] w-full justify-center h-[calc(100%-1.75rem)] pb-0">
                                  {/* Blue Earning Bar */}
                                  <div
                                    style={{ height: `${earnHeightPercent}%` }}
                                    className={`w-1.5 sm:w-2 rounded-t-sm transition-all duration-200 ${
                                      isHovered ? 'bg-blue-700 scale-y-105' : 'bg-[#2563eb]'
                                    }`}
                                  />
                                  {/* Light Blue Commission Bar */}
                                  <div
                                    style={{ height: `${commHeightPercent}%` }}
                                    className={`w-1 sm:w-1.5 rounded-t-sm transition-all duration-200 ${
                                      isHovered ? 'bg-sky-400 scale-y-105' : 'bg-[#93c5fd]'
                                    }`}
                                  />
                                </div>

                                {/* Day label neatly contained below the baseline */}
                                <span
                                  className={`text-[10px] h-7 flex items-center justify-center transition-colors select-none ${
                                    isHovered ? 'text-slate-900 font-bold' : 'text-slate-400'
                                  }`}
                                >
                                  {item.day}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM TWO TABLES SIDE-BY-SIDE: "Top Selling Product" & "Top rated items" */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. TOP SELLING PRODUCT */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Top Selling Product
                    </h3>
                    <button
                      onClick={() => setActiveTab('items')}
                      className="text-xs text-[#00a389] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-100">
                          <th className="py-2.5 font-normal">Product Name</th>
                          <th className="py-2.5 font-normal">Category</th>
                          <th className="py-2.5 font-normal">Price</th>
                          <th className="py-2.5 font-normal">Sold</th>
                          <th className="py-2.5 font-normal text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topSellingList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2.5">
                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-500">{item.category}</td>
                            <td className="py-3 font-semibold text-slate-800">${item.price}</td>
                            <td className="py-3 font-bold text-slate-700">{item.sold}</td>
                            <td className="py-3 text-right font-bold text-emerald-600">${item.profit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. TOP RATED ITEMS */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Top rated items
                    </h3>
                    <button
                      onClick={() => setActiveTab('items')}
                      className="text-xs text-[#00a389] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-100">
                          <th className="py-2.5 font-normal">Product Name</th>
                          <th className="py-2.5 font-normal">Category</th>
                          <th className="py-2.5 font-normal">Price</th>
                          <th className="py-2.5 font-normal">Rating</th>
                          <th className="py-2.5 font-normal text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topRatedList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 pr-2">
                              <div className="flex items-center gap-2.5">
                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <span className="font-bold text-slate-800 line-clamp-1">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-500">{item.category}</td>
                            <td className="py-3 font-semibold text-slate-800">${item.price}</td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                                ★ {item.rating} ({item.reviews} Reviews)
                              </span>
                            </td>
                            <td className="py-3 text-right font-bold text-emerald-600">${item.profit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: ITEMS (INVENTORY & PRODUCT CATALOG) ==================== */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Product & Inventory Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time stock controls, product editing, price adjustments, and catalog updates
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#00a389] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#008f77] transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add New Item
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name or category..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:border-[#00a389] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <span className="text-xs text-slate-400 font-medium">Category:</span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs focus:border-[#00a389] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-4">Item Details</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock Level</th>
                        <th className="py-3.5 px-4 text-center">Quick Stock Adjust</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => {
                        const isOut = p.stock === 0;
                        const isLow = p.stock > 0 && p.stock <= 5;
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {p._id}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                {p.category}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-black text-slate-900">${p.price.toFixed(2)}</td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{p.stock}</span>
                                {isOut ? (
                                  <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                    OUT OF STOCK
                                  </span>
                                ) : isLow ? (
                                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                    LOW ({p.stock})
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    IN STOCK
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleStockUpdate(p._id, -5)}
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                  title="Decrease stock by 5"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleStockUpdate(p._id, -1)}
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                  title="Decrease stock by 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleStockUpdate(p._id, 1)}
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                                  title="Increase stock by 1"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleStockUpdate(p._id, 10)}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                                  title="Restock +10 units"
                                >
                                  +10 Restock
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedProductToEdit(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#00a389]"
                                  title="Edit product"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id, p.name)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: ORDERS (ORDER MANAGEMENT) ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Order Fulfillment & Status Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track shipments, customer details, Stripe payments, and advance order status
                  </p>
                </div>
              </div>

              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending', label: 'Waiting For Confirmation' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'ready_for_delivery', label: 'Ready For Delivery' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'refunded', label: 'Refunded' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`rounded-xl px-3 py-1.5 transition-all ${
                      orderStatusFilter === tab.id
                        ? 'bg-[#00a389] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-4">Order ID & Date</th>
                        <th className="py-3.5 px-4">Customer & Shipping</th>
                        <th className="py-3.5 px-4">Payment & Speed</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Advance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                            <p className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{ord.customerName}</p>
                            <p className="text-[11px] text-slate-500">{ord.customerEmail}</p>
                            {(ord.customerPhone || ord.shippingAddress?.phone) && (
                              <p className="text-[11px] text-indigo-600 font-medium">
                                📞 {ord.customerPhone || ord.shippingAddress?.phone}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px]">
                              {ord.shippingAddress?.street}
                              {ord.shippingAddress?.apartment ? `, ${ord.shippingAddress?.apartment}` : ''}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode}
                            </p>
                            {ord.shippingAddress?.deliveryNotes && (
                              <p className="text-[9px] text-amber-600 italic mt-0.5">
                                Note: {ord.shippingAddress.deliveryNotes}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  ord.paymentMethod === 'cod'
                                    ? 'bg-amber-100 text-amber-800'
                                    : ord.paymentMethod === 'upi'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.paymentMethod === 'net_banking'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {ord.paymentMethod === 'cod'
                                  ? '💵 Cash on Delivery'
                                  : ord.paymentMethod === 'upi'
                                  ? '📱 UPI / Wallet'
                                  : ord.paymentMethod === 'net_banking'
                                  ? '🏦 Net Banking'
                                  : '💳 Stripe Card'}
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                                {ord.paymentDetails?.cardLast4
                                  ? `•••• ${ord.paymentDetails.cardLast4}`
                                  : ord.paymentDetails?.upiId
                                  ? ord.paymentDetails.upiId
                                  : ord.paymentDetails?.bankName
                                  ? ord.paymentDetails.bankName
                                  : ord.paymentId || 'Verified'}
                              </p>
                              <div className="text-[10px] text-slate-400">
                                Speed:{' '}
                                <strong className="text-slate-600">
                                  {ord.shippingAddress?.shippingMethod === 'express'
                                    ? '⚡ Express'
                                    : ord.shippingAddress?.shippingMethod === 'overnight'
                                    ? '🚀 Overnight'
                                    : '🚚 Standard'}
                                </strong>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-slate-700">{it.quantity}x</span>
                                  <span className="text-slate-500 truncate max-w-[160px]">{it.name}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                            ${ord.total.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'ready_for_delivery'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : ord.status === 'processing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ord.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ord.status === 'refunded'
                                  ? 'bg-pink-100 text-pink-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setActiveInvoiceOrder(ord)}
                                className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
                                title="View and print official automated tax invoice"
                              >
                                <Printer className="h-3 w-3" />
                                <span>Bill</span>
                              </button>
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(ord._id, e.target.value as OrderStatus)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:border-[#00a389] focus:outline-none"
                              >
                                <option value="pending">Waiting For Confirmation</option>
                                <option value="processing">Processing</option>
                                <option value="ready_for_delivery">Ready For Delivery</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="refunded">Refunded</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: POS (POINT OF SALE TERMINAL) ==================== */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product selector grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Point of Sale (POS) Cashier Terminal
                  </h1>
                  <span className="text-xs text-slate-400">Click item to add to register</span>
                </div>

                {posSuccessMsg && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                    {posSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.slice(0, 12).map((prod) => (
                    <button
                      key={prod._id}
                      onClick={() => handleAddToPos(prod)}
                      className="flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-3 hover:border-[#00a389] hover:shadow-md transition-all group"
                    >
                      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                        <Image src={prod.image} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="font-bold text-xs text-slate-900 line-clamp-1">{prod.name}</p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="font-black text-[#00a389]">${prod.price}</span>
                        <span className="text-[10px] text-slate-400">Stock: {prod.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* POS Receipt / Cart */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
                <h3 className="font-black text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Current Register Order</span>
                  <span className="text-xs text-slate-400 font-normal">{posCart.length} item(s)</span>
                </h3>

                <div className="my-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Customer Name</label>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#00a389]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-60 custom-scrollbar pr-1">
                  {posCart.map((item) => (
                    <div key={item.product._id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                      <div className="truncate max-w-[140px]">
                        <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">${item.product.price} x {item.qty}</p>
                      </div>
                      <span className="font-black text-slate-900">${(item.product.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  {!posCart.length && (
                    <p className="text-xs text-slate-400 text-center py-8">Select items on the left to add to sale</p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${posCart.reduce((sum, it) => sum + it.product.price * it.qty, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-slate-900 border-t border-slate-100 pt-2">
                    <span>Total Amount</span>
                    <span className="text-[#00a389]">
                      ${posCart.reduce((sum, it) => sum + it.product.price * it.qty, 0).toFixed(2)}
                    </span>
                  </div>

                  <button
                    disabled={!posCart.length}
                    onClick={handleCompletePosSale}
                    className="w-full mt-2 rounded-xl bg-[#00a389] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#008f77] disabled:opacity-50 transition-colors"
                  >
                    Complete In-Store Sale & Deduct Stock
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: CATEGORIES ==================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Store Categories
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize product catalog, category hierarchy, and merchandise grouping
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                  const catProducts = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
                  const avgPrice = catProducts.length
                    ? catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length
                    : 0;

                  return (
                    <div
                      key={cat}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#00a389] transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-[#00a389] flex items-center justify-center font-bold">
                          <Layers className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {catProducts.length} Products
                        </span>
                      </div>
                      <h3 className="font-black text-sm text-slate-900">{cat}</h3>
                      <p className="text-xs text-slate-400 mt-1">Average price: ${avgPrice.toFixed(0)}</p>
                      <button
                        onClick={() => {
                          setProductCategoryFilter(cat);
                          setActiveTab('items');
                        }}
                        className="mt-4 text-xs font-bold text-[#00a389] hover:underline"
                      >
                        View Items →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB: COUPONS ==================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Promotions & Coupon Codes
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate promotional codes used during customer cart checkout
                  </p>
                </div>
              </div>

              {/* Create coupon form */}
              <form
                onSubmit={handleCreateCoupon}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER25"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 uppercase focus:outline-none focus:border-[#00a389]"
                    required
                  />
                </div>

                <div className="w-36">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#00a389]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-5 rounded-xl bg-[#00a389] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#008f77] transition-colors"
                >
                  Create Coupon
                </button>
              </form>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((cp) => (
                  <div
                    key={cp.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                        {cp.code}
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                        {cp.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xl font-black text-[#00a389]">{cp.discountValue}% OFF</p>
                    <p className="text-xs text-slate-400 mt-1">Min. order spend: ${cp.minSpend}</p>
                    <p className="text-[11px] text-slate-500 mt-3">Redeemed {cp.usedCount} times</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB: REPORTS ==================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Financial & Sales Analytics
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed transaction audit, tax VAT metrics, and Stripe test mode settlements
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs text-slate-400 font-medium">Gross Sales Volume</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">$ 2,968.90</p>
                  <p className="text-[11px] text-emerald-600 mt-1">All Stripe Test Transactions Cleared</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs text-slate-400 font-medium">Estimated Platform VAT (7.5%)</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">$ 222.66</p>
                  <p className="text-[11px] text-slate-400 mt-1">Automated tax collection log</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                  <p className="text-xs text-slate-400 font-medium">Net Merchant Disbursement</p>
                  <p className="text-2xl font-black text-[#00a389] mt-1">$ 2,355.58</p>
                  <p className="text-[11px] text-slate-400 mt-1">After commission & tax deductions</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Admin Product Modal (Add & Edit) */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={selectedProductToEdit}
        onSaved={fetchDashboardData}
      />
    </div>
  );
}

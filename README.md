# Vendra — All-Devices E-Commerce Storefront with Real-Time Inventory & Admin Panel

A modern, full-stack cross-device e-commerce web application built with **Next.js 16 (App Router)**, **MongoDB / Mongoose**, **Stripe Test Mode**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. Storefront & All-Devices Product Catalog (`/`)
- **Comprehensive Device Ecosystem**:
  - 📱 **Smartphones & Mobile**: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, Google Pixel
  - 💻 **Laptops & Workstations**: MacBook Pro M1, Dell Inspiron 15, HP Probook 450, ASUS ROG
  - ⌚ **Smart Wearables**: Apple Watch Series 7, Galaxy Watch, Fitness Trackers
  - 🎧 **Audio & Sound**: Sony WH-1000XM5, Aura Pro Wireless ANC, Studio Microphones
  - 📟 **Tablets & iPads**: iPad Pro 12.9" M2, Galaxy Tab
  - 🎮 **Gaming & Consoles**: PlayStation 5 Pro, Xbox Series X, Gaming Mice, Mechanical Keyboards
  - 🖥️ **Displays & Desk Accessories**: 4K Curved Displays, MagSafe Wireless Charging Stations
- **Dynamic Search & Filtering**:
  - Instant text search across device names, descriptions, and tags.
  - Multi-category filtering and 1-click **Explore All Devices** shortcut strip.
  - Price bracket filters ($0–$150, $150–$350, $350+).
  - "In Stock Only" toggle filter.
  - Multi-criteria sorting (Newest, Price: Low to High, Price: High to Low, Highest Rated, Name).
- **Deep Product Modal**: Displays device specifications, stock status, ratings, and inventory-constrained quantity controls.

### 2. Shopping Cart & Stripe Test Mode Checkout Flow
- **Slide-over Shopping Cart Drawer**:
  - Live stock validation prevents adding more than available inventory.
  - Free shipping progress bar (orders over $150).
  - Promo code discounts (`VENDRA10` for 10% off, `SUPER20` for $20 off).
  - Real-time subtotal, discount, shipping, and tax calculation.
- **Customer Details & Delivery Options**:
  - Full Name, Email, Phone Number (`+1 (555) 382-9014`), Street Address, Apartment / Suite (`Apt 4B`), City, State, Postal Code, Country.
  - Delivery speed selection with live pricing updates: **Standard** (3-5 days), **Express** (1-2 days, +$10), and **Priority Overnight** (Next-day, +$25).
  - Delivery instructions / notes input for doorstep instructions.
- **Multiple Payment Methods**:
  - 💳 **Stripe Test Card**: 16-digit card input with 1-click **Autofill Test Card** (`4242 4242 4242 4242`) and **Test Decline** (`4000 0000 0000 0002`).
  - 📱 **UPI / Instant Digital Wallet**: VPA handles (`@okhdfcbank`, `@okaxis`, `@oksbi`, `@paytm`) with QR code & instant approval simulation.
  - 💵 **Cash on Delivery (COD)**: Doorstep cash/card payment upon delivery; order set to `pending` waiting for fulfillment.
  - 🏦 **Net Banking**: Bank selection dropdown across major institutions (Chase, BofA, Wells Fargo, Citibank, HDFC, ICICI, SBI, Barclays).
- **Automated Tax Invoice & Bill Generation**:
  - Automatically generates an official commercial **Tax Invoice / Bill of Supply** (`INV-2026-XXXX`) upon payment/order completion.
  - Complete legal invoice layout: Vendra corporate branding, logo, registered company address, EIN, and GST/VAT registration.
  - Official **PAID IN FULL** or **PAYMENT DUE ON DELIVERY** compliance verification stamp.
  - Itemized table with product SKUs, thumbnails, unit prices, quantities, and line totals.
  - Comprehensive tax and delivery charge breakdown (Subtotal, Express/Overnight Delivery, Discounts, Taxes & Grand Total).
  - Built-in **Print / Save as PDF** (`window.print()`), **Download HTML Invoice**, and **Simulated Email to Customer**.
  - Accessible on checkout completion (`OrderSuccessModal`), customer order tracking history (`/orders`), and admin order fulfillment table (`/admin`).

### 3. Role-Based Authentication & Demo Profiles
- **Role Guard**: Separate permissions for `customer` and `admin`.
- **1-Click Quick Demo Logins**:
  - **Admin**: `admin@store.com` (password: `admin123`) — Full admin dashboard access.
  - **Customer**: `user@store.com` (password: `user123`) — Storefront shopper and personal order tracking.
- Secure password hashing with `bcryptjs` and HTTP-only JWT cookies via `jose`.

### 4. Vendra Admin Dashboard & Inventory Console (`/admin`)
- **10 Pastel KPI Stat Cards**:
  1. Total Earning: `$ 2,968.90`
  2. Commission Given: `$ 390.66`
  3. Total Item: `2,600`
  4. In Stock: `18.6K`
  5. Out Of Stock: `190`
  6. Waiting For Confirmation: `15`
  7. Processing Order: `70`
  8. Ready For Delivery: `42`
  9. Delivered Items: `15K`
  10. Refunded: `$ 580.00`
- **Earning & Commission Chart**: 31-day visual interactive bar chart with day breakdown and tooltips.
- **Top Product Rankings**:
  - **Top Selling Product**: Apple Watch Series 7, MacBook Pro M1, Dell Inspiron 15, HP Probook 450.
  - **Top Rated Items**: 5-star items with verified review counts and margins.
- **Sidebar Modules**:
  - **POS (Point of Sale)**: Cashier register terminal for walk-in orders with immediate stock deductions.
  - **Order Management**: Status updater (`Waiting For Confirmation`, `Processing`, `Ready For Delivery`, `Shipped`, `Delivered`, `Refunded`).
  - **Inventory & Items Manager**: Quick adjustments (`-5`, `-1`, `+1`, `+10 Restock`), Add Product modal, edit, and delete.
  - **Categories & Coupons**: Promo discount manager (`VENDRA10`, etc.).
  - **Sales Report**: VAT calculations and disbursement breakdown.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.4.1 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose + Automatic turnkey fallback (in-memory / local cache) so the app runs immediately without manual database configuration.
- **Payment**: Stripe SDK (Test Mode simulation & Checkout Session API support)
- **Authentication**: JWT (`jose`) + `bcryptjs`
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
- `MONGODB_URI`: (Optional) MongoDB connection string (e.g. `mongodb://localhost:27017/ecommerce` or MongoDB Atlas). If omitted, the app runs with the synchronized fallback store.
- `STRIPE_SECRET_KEY`: (Optional) Stripe test secret key (`sk_test_...`). If omitted, the built-in Stripe Test Mode simulator handles all payment authorizations.
- `JWT_SECRET`: Secret key for JWT session encryption.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@store.com` | `admin123` | Storefront, Admin Panel (`/admin`), Inventory Adjustments, Order Fulfillment |
| **Customer** | `user@store.com` | `user123` | Storefront, Cart, Stripe Checkout, Order Tracking (`/orders`) |

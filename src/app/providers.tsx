'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import InvoiceModal from '@/components/InvoiceModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <InvoiceModal />
      </CartProvider>
    </AuthProvider>
  );
}

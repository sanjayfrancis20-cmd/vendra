import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vendra | E-commerce Storefront & Admin Dashboard',
  description:
    'Full-featured e-commerce platform with product catalog, search, shopping cart, Stripe Test Mode payment simulation, and live Vendra inventory management admin panel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

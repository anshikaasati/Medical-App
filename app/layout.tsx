import type { Metadata } from 'next';
import './globals.css';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const heading = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Next-Gen Marg ERP — Pharmacy Management',
  description: 'Smart cloud-based medicine ordering and prescription diagnostics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('font-sans', sans.variable, heading.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

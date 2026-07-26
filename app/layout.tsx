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
  title: 'MargPharmacy ERP — Next-Gen Retail Command Center',
  description:
    'AI-powered prescription OCR validation, CGST/SGST tax splitting invoice ledger, and atomic POS checkouts.',
  icons: { icon: '/favicon.ico' },
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

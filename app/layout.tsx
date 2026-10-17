import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Provene | Cryptographic UCO & SAF Traceability Platform',
  description:
    'Zero-Trust SHA-256 Chain of Custody for Used Cooking Oil (UCO) & Sustainable Aviation Fuel (SAF) Feedstock in Noida Sector 126, 104 & 76.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
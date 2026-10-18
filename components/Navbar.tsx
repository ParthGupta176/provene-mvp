'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    if (isPublicPage) {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      document.body.style.backgroundColor = '#020617';
      document.body.style.color = '#f8fafc';
    }
  }, [isPublicPage]);

  // Internal portals (/master, /kitchen, /driver) use their own Left Sidebar
  if (!isPublicPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              PROVENE
            </span>
            <p className="text-[11px] font-medium text-slate-500">
              Used Cooking Oil Collection & Biofuel Supply
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/#about" className="hover:text-emerald-600 transition">
            Why Provene
          </Link>
          <Link href="/#process" className="hover:text-emerald-600 transition">
            How It Works
          </Link>
          <Link href="/#portals" className="hover:text-emerald-600 transition">
            Partner Portals
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {pathname !== '/login' ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <LogIn className="h-4 w-4" />
              Partner Login
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              ← Back to Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
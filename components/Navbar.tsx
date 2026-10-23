'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LogIn, KeyRound } from 'lucide-react';

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

  if (!isPublicPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              PROVENE
            </span>
            <p className="text-[11px] font-medium text-slate-500">
              Used Cooking Oil Collection & Biofuel Supply
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <Link href="/#about" className="hover:text-emerald-600 transition">
            Why Provene
          </Link>
          <Link href="/#who-we-serve" className="hover:text-emerald-600 transition">
            Who We Serve
          </Link>
          <Link href="/#process" className="hover:text-emerald-600 transition">
            How It Works
          </Link>
          <Link href="/#compliance" className="hover:text-emerald-600 transition">
            FSSAI Compliance
          </Link>
          <Link href="/#portals" className="hover:text-emerald-600 transition">
            Platform Portals
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {pathname !== '/login' ? (
            <>
              <Link
                href="/login?mode=reset"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                Reset Password
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <LogIn className="h-4 w-4" />
                Portal Login
              </Link>
            </>
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
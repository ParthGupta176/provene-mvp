'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, LogOut, Store, Truck, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = pathname === '/' || pathname === '/login';

  // Light-Mode Corporate Navbar for Front Page (/) and Login Page (/login)
  if (isPublicPage) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                PROVENE <span className="text-emerald-600 font-mono text-sm">// BIO-LEDGER</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500">
                Verified Circular Supply Chain for Sustainable Aviation Fuel
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/#problem" className="hover:text-emerald-600 transition">
              The Crisis
            </Link>
            <Link href="/#how-it-works" className="hover:text-emerald-600 transition">
              How Provene Works
            </Link>
            <Link href="/#clusters" className="hover:text-emerald-600 transition">
              Noida Pilot Clusters
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {pathname !== '/login' ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <LogIn className="h-4 w-4" />
                Portal Login
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                ← Back to Website
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Operational Navbar when logged into /kitchen, /driver, or /audit
  const roleBadge =
    pathname === '/kitchen'
      ? { label: 'LOGGED IN: KITCHEN PARTNER (FBO)', icon: Store, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' }
      : pathname === '/driver'
      ? { label: 'LOGGED IN: FIELD COLLECTOR', icon: Truck, color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' }
      : { label: 'LOGGED IN: SAF COMMAND CENTER', icon: Activity, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };

  const RoleIcon = roleBadge.icon;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-base font-bold tracking-wider text-white">
              PROVENE <span className="text-emerald-400">//</span> SAF-LEDGER
            </span>
            <p className="text-[11px] text-slate-400">
              Noida Expressway Cluster (Sec 126 • 104 • 76)
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-semibold ${roleBadge.color}`}>
            <RoleIcon className="h-3.5 w-3.5" />
            {roleBadge.label}
          </div>

          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-red-500/50 hover:text-red-300 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Switch Account / Logout
          </button>
        </div>
      </div>
    </header>
  );
}
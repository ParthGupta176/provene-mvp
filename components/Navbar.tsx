'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Store, Truck, Activity, Layers } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Overview', icon: Layers },
        { href: '/kitchen', label: '1. Kitchen Portal (FBO)', icon: Store },
        { href: '/driver', label: '2. Collector App (SHA-256)', icon: Truck },
        { href: '/audit', label: '3. SAF Command Center', icon: Activity },
    ];

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
                            Cryptographic Circular Supply Chain • ISCC & FSSAI RUCO
                        </p>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Noida Expressway Cluster (Sec 126 • 104 • 76): ONLINE
                </div>

                <nav className="flex items-center gap-1 overflow-x-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${active
                                        ? 'bg-emerald-500 text-slate-950 font-semibold'
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
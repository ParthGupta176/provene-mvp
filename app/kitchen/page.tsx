'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Kitchen, Collection } from '@/lib/supabase';
import {
    Menu,
    Store,
    BellRing,
    Calendar,
    Download,
    Clock,
    CheckCircle2,
    Scale,
    IndianRupee,
    LogOut,
    FileCheck,
} from 'lucide-react';

export default function KitchenEnterprisePortal() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activePage, setActivePage] = useState<'history' | 'request-pickup' | 'download-ledger'>(
        'history'
    );

    const [kitchen, setKitchen] = useState<Kitchen | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    const [pickupRequested, setPickupRequested] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [estOilFullKg, setEstOilFullKg] = useState<number>(35);

    const [startDate, setStartDate] = useState<string>('2026-01-01');
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        async function loadRestaurantPortal() {
            setLoading(true);
            let loggedInKitchenId = 'ALL';
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('provene_session');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed.role === 'KITCHEN' && parsed.id) {
                            loggedInKitchenId = parsed.id;
                        }
                    } catch {
                        // ignore
                    }
                }
            }

            let currentK: Kitchen | null = null;
            if (loggedInKitchenId !== 'ALL') {
                const { data: kRow } = await supabase
                    .from('kitchens')
                    .select('*')
                    .eq('id', loggedInKitchenId)
                    .maybeSingle();
                const { data: cRows } = await supabase
                    .from('collections')
                    .select('*')
                    .eq('kitchen_id', loggedInKitchenId)
                    .order('created_at', { ascending: false });
                currentK = kRow || null;
                setCollections(cRows || []);
            } else {
                const { data: kRows } = await supabase.from('kitchens').select('*').limit(1);
                const { data: cRows } = await supabase
                    .from('collections')
                    .select('*')
                    .order('created_at', { ascending: false });
                currentK = kRows?.[0] || null;
                setCollections(cRows || []);
            }

            if (currentK) {
                setKitchen(currentK);
                setEstOilFullKg(currentK.weekly_est_uco_kg || 35);
                if (currentK.pickup_requested) {
                    setPickupRequested(true);
                    setEstimatedTime(currentK.pickup_eta || 'Today within 45–60 mins');
                }
            }
            setLoading(false);
        }
        loadRestaurantPortal();
    }, []);

    const handleRequestPickup = async () => {
        const etaString = `Today at ${new Date(Date.now() + 50 * 60000).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        })} (~50 mins)`;

        setPickupRequested(true);
        setEstimatedTime(etaString);

        if (kitchen) {
            await supabase
                .from('kitchens')
                .update({ pickup_requested: true, pickup_eta: etaString })
                .eq('id', kitchen.id);
        }
    };

    const handleDownloadFssaiLedger = () => {
        const startObj = new Date(startDate);
        startObj.setHours(0, 0, 0, 0);
        const endObj = new Date(endDate);
        endObj.setHours(23, 59, 59, 999);

        const filtered = collections.filter((c) => {
            const d = new Date(c.created_at);
            return d >= startObj && d <= endObj;
        });

        const csvRows = [
            ['OFFICIAL FSSAI USED COOKING OIL (RUCO) DISPOSAL LEDGER'],
            ['Restaurant Name', kitchen?.name || 'Partner Restaurant'],
            ['FSSAI License Number', kitchen?.fssai_number || 'Verified'],
            ['Owner / Manager', kitchen?.owner_name || '-'],
            ['Registered Address', kitchen?.address || 'Noida'],
            ['Report Date Range', `${startDate} to ${endDate}`],
            [],
            ['Pickup Date & Time', 'Drum ID', 'Oil Weight (kg)', 'Amount Paid (INR)', 'FSSAI Status'],
            ...filtered.map((c) => [
                new Date(c.created_at).toLocaleString('en-IN'),
                c.drum_id,
                `${c.weight_kg} kg`,
                `Rs. ${c.payout_inr}`,
                'Verified & Diverted for Biofuel',
            ]),
        ];

        const csvContent = csvRows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FSSAI_Ledger_${(kitchen?.name || 'Outlet').replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalOilKg = collections.reduce((sum, item) => sum + Number(item.weight_kg || 0), 0);
    const totalEarnedInr = collections.reduce((sum, item) => sum + Number(item.payout_inr || 0), 0);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
            {/* LEFT COLLAPSIBLE SIDEBAR */}
            <aside
                className={`${sidebarOpen ? 'w-60' : 'w-16'
                    } shrink-0 border-r border-slate-800/80 bg-[#0b101b] flex flex-col justify-between transition-all duration-200`}
            >
                <div>
                    <div className="flex h-14 items-center gap-2.5 border-b border-slate-800/80 px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
                            <Store className="h-4 w-4" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <span className="text-xs font-extrabold text-white block truncate">
                                    {kitchen?.name || 'KITCHEN PORTAL'}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 block">
                                    FSSAI Partner
                                </span>
                            </div>
                        )}
                    </div>

                    <nav className="p-2.5 space-y-1">
                        <button
                            onClick={() => setActivePage('history')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activePage === 'history'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <Calendar className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>Pickups & Schedule</span>}
                        </button>

                        <button
                            onClick={() => setActivePage('request-pickup')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activePage === 'request-pickup'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <BellRing className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>Request Oil Pickup</span>}
                        </button>

                        <button
                            onClick={() => setActivePage('download-ledger')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activePage === 'download-ledger'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <Download className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>FSSAI Ledger Export</span>}
                        </button>
                    </nav>
                </div>

                <div className="border-t border-slate-800/80 p-3">
                    <button
                        onClick={() => {
                            localStorage.removeItem('provene_session');
                            router.push('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:text-red-300"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b101b] px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <div>
                            <span className="text-sm font-bold text-white">{kitchen?.name}</span>
                            <span className="ml-3 font-mono text-xs text-slate-400">
                                FSSAI: {kitchen?.fssai_number}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setActivePage('request-pickup')}
                        className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                        {pickupRequested ? '✓ Pickup Scheduled' : '+ Request Pickup'}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activePage === 'history' && (
                        <div className="space-y-6">
                            {pickupRequested && (
                                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                        <div>
                                            <p className="text-xs font-bold uppercase text-amber-300">
                                                Scheduled Pickup Active • Estimated Arrival: {estimatedTime}
                                            </p>
                                            <p className="text-xs text-slate-300">
                                                A Provene collection vehicle has been assigned to your outlet.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="rounded bg-amber-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300">
                                        EN ROUTE
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-400">
                                        <span>Total Oil Diverted</span>
                                        <Scale className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <p className="mt-2 font-mono text-2xl font-bold text-white">
                                        {totalOilKg.toFixed(1)} kg
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-400">
                                        <span>Verified Pickups</span>
                                        <FileCheck className="h-4 w-4 text-sky-400" />
                                    </div>
                                    <p className="mt-2 font-mono text-2xl font-bold text-white">
                                        {collections.length}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-400">
                                        <span>Total Settlement Received</span>
                                        <IndianRupee className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <p className="mt-2 font-mono text-2xl font-bold text-emerald-400">
                                        ₹{totalEarnedInr.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                        Completed Oil Pickup Manifest
                                    </span>
                                    <button
                                        onClick={() => setActivePage('download-ledger')}
                                        className="text-xs font-semibold text-emerald-400 hover:underline"
                                    >
                                        Export FSSAI CSV →
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                            <tr>
                                                <th className="py-3 px-4">Date & Timestamp</th>
                                                <th className="py-3 px-4">Drum Seal ID</th>
                                                <th className="py-3 px-4">Net Oil Weight</th>
                                                <th className="py-3 px-4">UPI Settlement</th>
                                                <th className="py-3 px-4">FSSAI Compliance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-slate-500">
                                                        Loading records...
                                                    </td>
                                                </tr>
                                            ) : collections.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-10 text-center text-slate-500">
                                                        No pickups completed yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                collections.map((c) => (
                                                    <tr key={c.id} className="hover:bg-slate-800/30">
                                                        <td className="py-3 px-4 font-mono text-slate-200">
                                                            {new Date(c.created_at).toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono font-semibold text-sky-400">
                                                            {c.drum_id}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                                            {c.weight_kg} kg
                                                        </td>
                                                        <td className="py-3 px-4 font-mono font-bold text-white">
                                                            ₹{c.payout_inr}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                                ✓ RUCO VERIFIED
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'request-pickup' && (
                        <div className="mx-auto max-w-lg rounded-xl border border-slate-800/90 bg-[#0d1322] p-6 space-y-5">
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-base font-bold text-white">
                                    Schedule Doorstep Collection (Storage Full)
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Notify Provene dispatch when your storage drum reaches capacity.
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
                                    <span className="text-slate-400">Indexed Fryer Capacity:</span>
                                    <span className="font-mono font-bold text-white">
                                        {kitchen?.fryer_capacity_liters || 45} Liters
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1">
                                        Estimated Oil Volume Ready for Pickup (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={estOilFullKg}
                                        onChange={(e) => setEstOilFullKg(Number(e.target.value))}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-sm font-bold text-white"
                                    />
                                </div>
                            </div>

                            {pickupRequested ? (
                                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-1.5">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                                    <p className="text-sm font-bold text-white">Pickup Dispatched</p>
                                    <p className="text-xs text-emerald-300">
                                        Estimated Collection Window: <strong>{estimatedTime}</strong>
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestPickup}
                                    className="w-full rounded-lg bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                                >
                                    Confirm & Request Immediate Pickup
                                </button>
                            )}
                        </div>
                    )}

                    {activePage === 'download-ledger' && (
                        <div className="mx-auto max-w-lg rounded-xl border border-slate-800/90 bg-[#0d1322] p-6 space-y-5">
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-base font-bold text-white">
                                    Export Official FSSAI Disposal Ledger
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Select a date range to download your audit-ready CSV ledger with restaurant
                                    details and pickup logs.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadFssaiLedger}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                            >
                                <Download className="h-4 w-4" />
                                Download Official FSSAI Ledger (.CSV)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
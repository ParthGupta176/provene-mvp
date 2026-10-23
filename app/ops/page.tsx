'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Kitchen, Collection, Driver } from '@/lib/supabase';
import {
    Menu,
    ShieldCheck,
    LayoutDashboard,
    Store,
    Truck,
    Droplets,
    BellRing,
    RefreshCw,
    Search,
    KeyRound,
    LogOut,
    X,
    CheckCircle2,
    MapPin,
} from 'lucide-react';

export default function ProveneOperationsPortal() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'radar' | 'kitchens' | 'fleet' | 'manifest'>('radar');

    const [staffName, setStaffName] = useState('Operations Staff');
    const [staffId, setStaffId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState('');

    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    // Change Password Modal
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passError, setPassError] = useState('');

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<unknown>(null);

    async function loadOpsData() {
        const [kRes, cRes, dRes] = await Promise.all([
            supabase.from('kitchens').select('*').order('pickup_requested', { ascending: false }),
            supabase.from('collections').select('*').order('created_at', { ascending: false }),
            supabase.from('drivers').select('*').order('created_at', { ascending: false }),
        ]);

        setKitchens(kRes.data || []);
        setCollections(cRes.data || []);
        setDrivers(dRes.data || []);
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('provene_session');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.name) setStaffName(parsed.name);
                    if (parsed.id) setStaffId(parsed.id);
                } catch {
                    // ignore
                }
            }
        }
        loadOpsData();
    }, []);

    // Map Initialization
    useEffect(() => {
        if (activeTab !== 'radar' || typeof window === 'undefined' || !mapContainerRef.current) return;

        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const initMap = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const L = (window as any).L;
            if (!L || !mapContainerRef.current) return;

            if (mapInstanceRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (mapInstanceRef.current as any).remove();
            }

            const map = L.map(mapContainerRef.current).setView([28.5505, 77.361], 12);
            mapInstanceRef.current = map;

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            const bounds: [number, number][] = [];
            kitchens.forEach((k) => {
                bounds.push([k.lat, k.lng]);
                const isUrgent = Boolean(k.pickup_requested);
                const marker = L.circleMarker([k.lat, k.lng], {
                    radius: isUrgent ? 10 : 7,
                    fillColor: isUrgent ? '#f59e0b' : '#10b981',
                    color: '#090d16',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.95,
                }).addTo(map);

                marker.bindPopup(
                    `<div style="font-size:12px;font-family:sans-serif;color:#0f172a;">
            <strong>${k.name}</strong><br/>
            <span>Fryer: ${k.fryer_capacity_liters}L</span><br/>
            <span>Status: ${isUrgent ? 'URGENT PICKUP' : 'Standard'}</span>
          </div>`
                );
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).L) {
            setTimeout(initMap, 50);
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.body.appendChild(script);
        }
    }, [activeTab, kitchens]);

    const notify = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        if (newPass.length < 5) {
            setPassError('Password must be at least 5 characters.');
            return;
        }
        if (newPass !== confirmPass) {
            setPassError('Passwords do not match.');
            return;
        }
        if (!staffId) return;

        const { error } = await supabase
            .from('employees')
            .update({ password: newPass.trim() })
            .eq('id', staffId);

        if (!error) {
            notify('Password updated successfully.');
            setPasswordModalOpen(false);
            setNewPass('');
            setConfirmPass('');
        } else {
            setPassError(error.message);
        }
    };

    const totalCollectedKg = collections.reduce((s, c) => s + Number(c.weight_kg || 0), 0);
    const urgentRequests = kitchens.filter((k) => k.pickup_requested);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
            {/* SIDEBAR */}
            <aside
                className={`${sidebarOpen ? 'w-60' : 'w-16'
                    } shrink-0 border-r border-slate-800/80 bg-[#0b101b] flex flex-col justify-between transition-all duration-200 z-30`}
            >
                <div>
                    <div className="flex h-14 items-center gap-2.5 border-b border-slate-800/80 px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <span className="text-xs font-extrabold text-white block truncate">PROVENE OPS</span>
                                <span className="text-[10px] font-mono text-emerald-400 block truncate">
                                    Operations Console
                                </span>
                            </div>
                        )}
                    </div>

                    <nav className="p-2.5 space-y-1">
                        <button
                            onClick={() => setActiveTab('radar')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeTab === 'radar'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>Dispatch Radar</span>}
                        </button>

                        <button
                            onClick={() => setActiveTab('kitchens')}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeTab === 'kitchens'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Store className="h-4 w-4 shrink-0" />
                                {sidebarOpen && <span>Kitchen Queue</span>}
                            </div>
                            {sidebarOpen && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                    {kitchens.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeTab === 'fleet'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Truck className="h-4 w-4 shrink-0" />
                                {sidebarOpen && <span>Fleet Status</span>}
                            </div>
                            {sidebarOpen && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                    {drivers.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('manifest')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeTab === 'manifest'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <Droplets className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>Daily Manifest</span>}
                        </button>
                    </nav>
                </div>

                {/* Change Password & Logout */}
                <div className="border-t border-slate-800/80 p-3 space-y-2">
                    {sidebarOpen && (
                        <div className="rounded-lg bg-slate-900/90 px-3 py-2 border border-slate-800/80">
                            <p className="text-xs font-semibold text-white truncate">{staffName}</p>
                            <p className="text-[10px] text-emerald-400 font-mono">Operations Dispatcher</p>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setPassError('');
                            setPasswordModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <KeyRound className="h-4 w-4 shrink-0 text-emerald-400" />
                        {sidebarOpen && <span>Change Password</span>}
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem('provene_session');
                            router.push('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:text-red-300 transition"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTAINER */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b101b] px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <div className="relative hidden sm:block w-72">
                            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search kitchens, drivers..."
                                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {urgentRequests.length > 0 && (
                            <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                                <BellRing className="h-3.5 w-3.5 animate-bounce" />
                                {urgentRequests.length} Pending Pickup{urgentRequests.length > 1 ? 's' : ''}
                            </span>
                        )}
                        <button
                            onClick={loadOpsData}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Sync
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {toast && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            {toast}
                        </div>
                    )}

                    {/* TELEMETRY */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Total Diverted Oil
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                                {totalCollectedKg.toFixed(1)} kg
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Active Kitchens
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-white">{kitchens.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Active Drivers
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-sky-400">{drivers.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Urgent Pickups
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-amber-400">
                                {urgentRequests.length}
                            </p>
                        </div>
                    </div>

                    {/* TAB 1: RADAR */}
                    {activeTab === 'radar' && (
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-400" />
                                        <span className="text-xs font-bold uppercase text-white">
                                            Operational Network Map
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        Amber: Pickup Requested • Green: Standard
                                    </span>
                                </div>
                                <div
                                    ref={mapContainerRef}
                                    className="h-[400px] w-full bg-slate-950 z-0 [&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-95 [&_.leaflet-tile-pane]:contrast-90"
                                />
                            </div>

                            <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0d1322] p-4 space-y-3">
                                <h3 className="text-xs font-bold uppercase text-white">Active Pickup Requests</h3>
                                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                                    {urgentRequests.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-500">
                                            No active pickup requests right now.
                                        </div>
                                    ) : (
                                        urgentRequests.map((k) => (
                                            <div
                                                key={k.id}
                                                className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-white">{k.name}</span>
                                                    <span className="font-mono text-[10px] text-amber-400">
                                                        Fryer: {k.fryer_capacity_liters}L
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{k.address}</p>
                                                <p className="font-mono text-[10px] text-slate-500 mt-1">
                                                    Phone: {k.phone}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: KITCHEN ROSTER */}
                    {activeTab === 'kitchens' && (
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Restaurant</th>
                                        <th className="py-3 px-4">Contact</th>
                                        <th className="py-3 px-4">FSSAI Number</th>
                                        <th className="py-3 px-4">Fryer Cap</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {kitchens
                                        .filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((k) => (
                                            <tr key={k.id} className="hover:bg-slate-800/30">
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-white">{k.name}</p>
                                                    <p className="text-[11px] text-slate-400">{k.address}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-slate-300">{k.owner_name}</p>
                                                    <p className="font-mono text-[10px] text-slate-400">{k.phone}</p>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-300">{k.fssai_number}</td>
                                                <td className="py-3 px-4 font-mono text-slate-300">
                                                    {k.fryer_capacity_liters} L
                                                </td>
                                                <td className="py-3 px-4">
                                                    {k.pickup_requested ? (
                                                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                                            ● DRUM FULL
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                            ● ACTIVE
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 3: FLEET */}
                    {activeTab === 'fleet' && (
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Driver Name</th>
                                        <th className="py-3 px-4">Phone</th>
                                        <th className="py-3 px-4">Vehicle Number</th>
                                        <th className="py-3 px-4">Fleet Type</th>
                                        <th className="py-3 px-4">Assigned Buyer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {drivers.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-800/30">
                                            <td className="py-3 px-4 font-bold text-white">{d.name}</td>
                                            <td className="py-3 px-4 font-mono text-slate-400">{d.phone}</td>
                                            <td className="py-3 px-4 font-mono text-sky-400">{d.vehicle_number}</td>
                                            <td className="py-3 px-4">
                                                <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300">
                                                    {d.employment_type === 'PROVENE_HIRED' ? 'IN-HOUSE' : '3PL AGGREGATOR'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300">{d.aggregator_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB 4: MANIFEST */}
                    {activeTab === 'manifest' && (
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4">Drum ID</th>
                                        <th className="py-3 px-4">Kitchen</th>
                                        <th className="py-3 px-4">Driver</th>
                                        <th className="py-3 px-4 text-right">Net Weight</th>
                                        <th className="py-3 px-4 text-right">Payout (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {collections.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-800/30">
                                            <td className="py-3 px-4 font-mono text-slate-400">
                                                {new Date(c.created_at).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-sky-400 font-semibold">{c.drum_id}</td>
                                            <td className="py-3 px-4 font-bold text-white">{c.kitchen_name}</td>
                                            <td className="py-3 px-4 text-slate-300">{c.driver_name || 'Fleet Driver'}</td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                                                {c.weight_kg} kg
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-200">
                                                ₹{c.payout_inr}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* CHANGE PASSWORD MODAL */}
            {passwordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white">Change Ops Password</h3>
                            <button
                                onClick={() => setPasswordModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {passError && (
                            <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-2 text-xs text-red-300">
                                {passError}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 mb-1">New Password *</label>
                                <input
                                    type="password"
                                    required
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1">Confirm New Password *</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-emerald-500 py-2.5 font-bold text-slate-950 hover:bg-emerald-400"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
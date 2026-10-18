'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, Kitchen, Collection } from '@/lib/supabase';
import {
    Store,
    MapPin,
    FileCheck,
    Printer,
    CheckCircle2,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';

const CLUSTER_PRESETS = [
    {
        label: 'Sector 126 Market',
        lat: 28.5442,
        lng: 77.334,
        address: 'Main Market, Sector 126, Noida',
    },
    {
        label: 'Sector 104 Market',
        lat: 28.5389,
        lng: 77.3688,
        address: 'Commercial Market, Sector 104, Noida',
    },
    {
        label: 'Sector 76 Market',
        lat: 28.5672,
        lng: 77.3792,
        address: 'Central Food Market, Sector 76, Noida',
    },
];

export default function KitchenPortalPage() {
    const [activeTab, setActiveTab] = useState<'onboard' | 'certificates'>('onboard');
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedKitchenId, setSelectedKitchenId] = useState<string>('ALL');

    // Form states
    const [name, setName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [fssaiNumber, setFssaiNumber] = useState('');
    const [fryerCapacity, setFryerCapacity] = useState<number>(40);
    const [address, setAddress] = useState('Main Market, Sector 126, Noida');
    const [lat, setLat] = useState<number>(28.5442);
    const [lng, setLng] = useState<number>(77.334);
    const [isccDeclared, setIsccDeclared] = useState(true);
    const [gpsStatus, setGpsStatus] = useState('Selected Cluster: Sector 126, Noida');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Signature canvas ref
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    async function fetchAllData() {
        const { data: kData } = await supabase
            .from('kitchens')
            .select('*')
            .order('created_at', { ascending: false });
        const { data: cData } = await supabase
            .from('collections')
            .select('*')
            .order('created_at', { ascending: false });
        setKitchens(kData || []);
        setCollections(cData || []);
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    // Touch & Mouse Signature Pad Handlers
    const startDrawing = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const endDrawing = () => setIsDrawing(false);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const lockLiveGps = () => {
        if (!navigator.geolocation) {
            setGpsStatus('Geolocation not supported — use Sector 126 / 104 / 76 preset below');
            return;
        }
        setGpsStatus('Acquiring satellite lock...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(Number(pos.coords.latitude.toFixed(6)));
                setLng(Number(pos.coords.longitude.toFixed(6)));
                setGpsStatus(
                    `Live GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
                );
            },
            () => {
                setGpsStatus('Browser blocked GPS — select Sector 126 / 104 / 76 preset below');
            }
        );
    };

    const handleOnboardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMsg('');

        const sigData = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
        const weeklyEst = Number((fryerCapacity * 0.85).toFixed(1));

        const { error } = await supabase.from('kitchens').insert([
            {
                name,
                owner_name: ownerName,
                phone,
                fssai_number: fssaiNumber,
                fryer_capacity_liters: Number(fryerCapacity),
                weekly_est_uco_kg: weeklyEst,
                lat,
                lng,
                address,
                signature_data: sigData,
                iscc_declared: isccDeclared,
            },
        ]);

        setSubmitting(false);
        if (!error) {
            setSuccessMsg(`Successfully onboarded "${name}" into Noida Expressway Cluster!`);
            setName('');
            setOwnerName('');
            setPhone('');
            setFssaiNumber('');
            clearSignature();
            await fetchAllData();
            setTimeout(() => setActiveTab('certificates'), 1200);
        } else {
            alert('Supabase Error: ' + error.message);
        }
    };

    const filteredCollections =
        selectedKitchenId === 'ALL'
            ? collections
            : collections.filter((c) => c.kitchen_id === selectedKitchenId);

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Store className="h-6 w-6 text-emerald-400" />
                        FBO Kitchen Onboarding & FSSAI RUCO Portal
                    </h1>
                    <p className="text-xs text-slate-400">
                        ISCC EU Point-of-Origin Self-Declaration & Official Disposal Certificate Generator
                        (Sector 126 • Sector 104 • Sector 76)
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('onboard')}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === 'onboard'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        1. Onboard New Kitchen
                    </button>
                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === 'certificates'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        2. FSSAI RUCO Certificates ({collections.length})
                    </button>
                </div>
            </div>

            {activeTab === 'onboard' ? (
                <form
                    onSubmit={handleOnboardSubmit}
                    className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
                >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="text-sm font-semibold text-emerald-400">
                            New Commercial Kitchen Registration (Point of Origin)
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setName('Sector 126 Main Market Kitchen');
                                setOwnerName('Rajesh Sharma');
                                setPhone('9811548290');
                                setFssaiNumber('22724101001928');
                                setFryerCapacity(50);
                                setAddress('Main Market, Sector 126, Noida');
                                setLat(28.5442);
                                setLng(77.334);
                                setGpsStatus('Demo Fill: Sector 126, Noida');
                            }}
                            className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
                        >
                            Quick Demo Fill
                        </button>
                    </div>

                    {successMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                Restaurant / Mess Name *
                            </label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter outlet name"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                Owner / Manager Name *
                            </label>
                            <input
                                required
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Enter owner name"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                WhatsApp / UPI Phone *
                            </label>
                            <input
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit mobile number"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                14-Digit FSSAI License Number *
                            </label>
                            <input
                                required
                                value={fssaiNumber}
                                onChange={(e) => setFssaiNumber(e.target.value)}
                                placeholder="e.g., 22724101000912"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">
                                Total Commercial Fryer Capacity (Liters)
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">
                                Max Plausible Weekly UCO: {(fryerCapacity * 0.85).toFixed(1)} kg
                            </span>
                        </div>
                        <input
                            type="number"
                            min={5}
                            max={500}
                            required
                            value={fryerCapacity}
                            onChange={(e) => setFryerCapacity(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                        />
                        <p className="text-[11px] text-slate-400">
                            Used by Provene&apos;s plausibility algorithm to prevent synthetic palm-oil dilution
                            fraud.
                        </p>
                    </div>

                    {/* Cluster Location & GPS Lock */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                                Geofence Location Lock ({lat}, {lng})
                            </span>
                            <button
                                type="button"
                                onClick={lockLiveGps}
                                className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
                            >
                                Lock Live Phone GPS
                            </button>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-mono">{gpsStatus}</p>

                        <div className="flex flex-wrap gap-2">
                            {CLUSTER_PRESETS.map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                        setLat(preset.lat);
                                        setLng(preset.lng);
                                        setAddress(preset.address);
                                        setGpsStatus(`Selected Cluster: ${preset.label}`);
                                    }}
                                    className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500/50 hover:text-white"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Market / Sector Address"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                        />
                    </div>

                    {/* Digital Signature Pad */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-300">
                                FBO Owner Touch Signature (ISCC Self-Declaration)
                            </label>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                            >
                                <RotateCcw className="h-3 w-3" /> Clear Pad
                            </button>
                        </div>
                        <canvas
                            ref={canvasRef}
                            width={560}
                            height={120}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseLeave={endDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={endDrawing}
                            className="w-full cursor-crosshair rounded-xl border border-slate-700 bg-slate-950 touch-none"
                        />
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isccDeclared}
                            onChange={(e) => setIsccDeclared(e.target.checked)}
                            required
                            className="mt-0.5 rounded border-slate-700 text-emerald-500"
                        />
                        <span>
                            I hereby declare under <strong>ISCC EU & FSSAI RUCO guidelines</strong> that all Used
                            Cooking Oil supplied from this establishment originates strictly from food preparation
                            and contains zero virgin oil or intentional adulterants.
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                        {submitting
                            ? 'Registering on Ledger...'
                            : 'Complete Kitchen Onboarding & Lock Geofence'}
                    </button>
                </form>
            ) : (
                /* Tab 2: FSSAI RUCO Disposal Certificates */
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Filter by Kitchen:</span>
                            <select
                                value={selectedKitchenId}
                                onChange={(e) => setSelectedKitchenId(e.target.value)}
                                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                            >
                                <option value="ALL">
                                    All Noida Expressway Kitchens ({collections.length})
                                </option>
                                {kitchens.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.name} ({k.address})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                        >
                            <Printer className="h-4 w-4" /> Print / Save Official RUCO PDF
                        </button>
                    </div>

                    {filteredCollections.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
                            No collections logged yet. Go to <strong>2. Collector App (SHA-256)</strong> or click{' '}
                            <strong>Seed Sec 126/104/76 Demo Data</strong> in the SAF Command Center.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredCollections.map((c) => (
                                <div
                                    key={c.id}
                                    className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-5 space-y-3 print:border-black print:bg-white print:text-black"
                                >
                                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                                        <div>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase text-emerald-400">
                                                <ShieldCheck className="h-3.5 w-3.5" /> Official FSSAI RUCO & ISCC
                                                Certificate
                                            </span>
                                            <h3 className="text-lg font-bold text-white print:text-black">
                                                {c.kitchen_name}
                                            </h3>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
                                            {c.plausibility_status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate-400">Sealed Drum Tag:</span>
                                            <p className="font-mono font-semibold text-white print:text-black">
                                                {c.drum_id}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Net Verified Weight:</span>
                                            <p className="font-mono font-semibold text-emerald-400">{c.weight_kg} kg</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Field Quality Assay:</span>
                                            <p className="font-mono text-white print:text-black">
                                                TPC: {c.tpc_percent}% | MIU: {c.moisture_percent}%
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Instant UPI Settlement:</span>
                                            <p className="font-mono font-semibold text-white print:text-black">
                                                ₹{c.payout_inr} (@ ₹36/kg)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                                        <span className="text-slate-500 block mb-0.5">
                                            IMMUTABLE SHA-256 BATCH SIGNATURE:
                                        </span>
                                        <span className="text-emerald-400">{c.sha256_hash}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                        <span>Timestamp: {new Date(c.created_at).toLocaleString()}</span>
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <FileCheck className="h-3.5 w-3.5" /> Diverted from Food Chain
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
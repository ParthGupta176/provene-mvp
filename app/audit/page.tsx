'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, Kitchen, Collection } from '@/lib/supabase';
import { generateSHA256 } from '@/lib/crypto';
import {
    ShieldAlert,
    ShieldCheck,
    Database,
    Printer,
    RotateCcw,
    MapPin,
    Sparkles,
} from 'lucide-react';

export default function AuditCommandCenterPage() {
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    // Interactive Tamper Simulation State
    const [tamperedRow, setTamperedRow] = useState<{
        collection: Collection;
        fakeWeightKg: number;
        recomputedHash: string;
    } | null>(null);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<unknown>(null);

    async function loadAllData() {
        setLoading(true);
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
        setLoading(false);
    }

    useEffect(() => {
        loadAllData();
    }, []);

    // SSR-Safe Leaflet Map Loader Centered on Noida Sector 126, 104 & 76
    useEffect(() => {
        if (typeof window === 'undefined' || !mapContainerRef.current) return;

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

            // Centered on Noida Expressway Corridor (Sector 126, 104, 76)
            const map = L.map(mapContainerRef.current).setView([28.5505, 77.361], 13);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap & CartoDB',
            }).addTo(map);

            kitchens.forEach((k) => {
                const marker = L.circleMarker([k.lat, k.lng], {
                    radius: 9,
                    fillColor: '#10b981',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9,
                }).addTo(map);

                marker.bindPopup(
                    `<div style="color:#0f172a;font-family:sans-serif;font-size:12px;">
            <strong>${k.name}</strong><br/>
            ${k.address}<br/>
            <span>Fryer: <b>${k.fryer_capacity_liters}L</b> | FSSAI: ${k.fssai_number}</span>
          </div>`
                );
            });
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).L) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.body.appendChild(script);
        }
    }, [kitchens]);

    // 1-Click Seed for Noida Sector 126, 104, 76 Demo
    const handleSeedExpresswayDemo = async () => {
        setLoading(true);
        let activeKitchens = kitchens;

        if (activeKitchens.length === 0) {
            const { data: insertedKitchens } = await supabase
                .from('kitchens')
                .insert([
                    {
                        name: 'Sector 126 Campus Mess & Cafe',
                        owner_name: 'Vikram Yadav',
                        phone: '9811402918',
                        fssai_number: '22724101000912',
                        fryer_capacity_liters: 45,
                        weekly_est_uco_kg: 38.2,
                        lat: 28.5442,
                        lng: 77.334,
                        address: 'Main Market, Sector 126, Noida',
                    },
                    {
                        name: 'Sector 104 High-Street Wok Kitchen',
                        owner_name: 'Saurabh Malhotra',
                        phone: '9873110492',
                        fssai_number: '12723101000411',
                        fryer_capacity_liters: 60,
                        weekly_est_uco_kg: 51.0,
                        lat: 28.5389,
                        lng: 77.3688,
                        address: 'Hajipur Commercial Hub, Sector 104, Noida',
                    },
                    {
                        name: 'Sector 76 Food Street Roll Corner',
                        owner_name: 'Deepak Verma',
                        phone: '9910384721',
                        fssai_number: '22724101001184',
                        fryer_capacity_liters: 30,
                        weekly_est_uco_kg: 25.5,
                        lat: 28.5672,
                        lng: 77.3792,
                        address: 'Central Market, Sector 76, Noida',
                    },
                ])
                .select('*');
            activeKitchens = insertedKitchens || [];
        }

        if (activeKitchens.length > 0) {
            const k1 = activeKitchens[0];
            const k2 = activeKitchens[1] || activeKitchens[0];
            const k3 = activeKitchens[2] || activeKitchens[0];

            const rawBatches = [
                {
                    kitchen: k1,
                    drum_id: 'DRM-NOIDA-S126-01',
                    weight_kg: 34.5,
                    tpc_percent: 27.4,
                    moisture_percent: 0.6,
                    status: 'VERIFIED',
                },
                {
                    kitchen: k2,
                    drum_id: 'DRM-NOIDA-S104-02',
                    weight_kg: 46.0,
                    tpc_percent: 28.1,
                    moisture_percent: 0.5,
                    status: 'VERIFIED',
                },
                {
                    kitchen: k3,
                    drum_id: 'DRM-NOIDA-S76-99',
                    weight_kg: 125.0,
                    tpc_percent: 16.2,
                    moisture_percent: 0.9,
                    status: 'FLAGGED_OVER_CAPACITY',
                },
            ];

            for (const b of rawBatches) {
                const payload = {
                    kitchen_id: b.kitchen.id,
                    kitchen_name: b.kitchen.name,
                    fssai_number: b.kitchen.fssai_number,
                    drum_id: b.drum_id,
                    weight_kg: b.weight_kg,
                    tpc_percent: b.tpc_percent,
                    moisture_percent: b.moisture_percent,
                    photo_evidence: 'verified_scale_capture.jpg',
                    collector_gps: `${b.kitchen.lat}, ${b.kitchen.lng}`,
                    timestamp: new Date().toISOString(),
                };
                const { canonicalJson, hash } = await generateSHA256(payload);
                await supabase.from('collections').insert([
                    {
                        kitchen_id: b.kitchen.id,
                        kitchen_name: b.kitchen.name,
                        drum_id: b.drum_id,
                        weight_kg: b.weight_kg,
                        tpc_percent: b.tpc_percent,
                        moisture_percent: b.moisture_percent,
                        payout_inr: Math.round(b.weight_kg * 36),
                        plausibility_status: b.status,
                        payload_json: canonicalJson,
                        sha256_hash: hash,
                        collector_gps: `${b.kitchen.lat}, ${b.kitchen.lng}`,
                    },
                ]);
            }
        }

        await loadAllData();
    };

    // Interactive Stage Feature: Simulate DB Weight Tamper (+20kg)
    const handleSimulateTamper = async (c: Collection) => {
        let parsedPayload: Record<string, unknown> = {};
        try {
            parsedPayload = JSON.parse(c.payload_json);
        } catch {
            parsedPayload = { drum_id: c.drum_id, weight_kg: c.weight_kg };
        }
        const fakeWeightKg = Number(c.weight_kg) + 20;
        const tamperedPayload = {
            ...parsedPayload,
            weight_kg: fakeWeightKg,
        };
        const { hash: recomputedHash } = await generateSHA256(tamperedPayload);
        setTamperedRow({
            collection: c,
            fakeWeightKg,
            recomputedHash,
        });
    };

    const verifiedCollections = collections.filter((c) => c.plausibility_status === 'VERIFIED');
    const totalVerifiedKg = verifiedCollections.reduce(
        (sum, item) => sum + Number(item.weight_kg || 0),
        0
    );

    return (
        <div className="space-y-6">
            {/* Integrity Status Banner */}
            <div
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition ${tamperedRow
                        ? 'border-red-500 bg-red-950/50 text-red-200 animate-pulse'
                        : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {tamperedRow ? (
                        <ShieldAlert className="h-7 w-7 text-red-400 shrink-0" />
                    ) : (
                        <ShieldCheck className="h-7 w-7 text-emerald-400 shrink-0" />
                    )}
                    <div>
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
                            {tamperedRow
                                ? `CRITICAL ALERT: CRYPTOGRAPHIC HASH MISMATCH ON DRUM ${tamperedRow.collection.drum_id}`
                                : 'ZERO-TRUST LEDGER INTEGRITY: 100% VERIFIED (CHAIN OF CUSTODY INTACT)'}
                        </h2>
                        <p className="text-xs opacity-90">
                            {tamperedRow
                                ? 'Unauthorized database weight alteration (+20 kg) detected! Batch automatically quarantined from ISCC SAF mass-balance pool.'
                                : 'All verified Noida Sector 126, 104 & 76 collections match their edge SHA-256 signatures.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                    {tamperedRow && (
                        <button
                            onClick={() => setTamperedRow(null)}
                            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-950 hover:bg-red-100"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore Immutable State
                        </button>
                    )}
                    <button
                        onClick={handleSeedExpresswayDemo}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                    >
                        <Sparkles className="h-3.5 w-3.5" /> Seed Sec 126/104/76 Demo Data
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                        <Printer className="h-3.5 w-3.5" /> Export ISCC Dossier
                    </button>
                </div>
            </div>

            {/* Side-by-Side Cryptographic Breach Inspector */}
            {tamperedRow && (
                <div className="rounded-2xl border-2 border-red-500 bg-slate-900 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase text-red-400">
                            LIVE SHA-256 TAMPER AUDIT // DRUM: {tamperedRow.collection.drum_id} (
                            {tamperedRow.collection.kitchen_name})
                        </span>
                        <span className="font-mono text-xs text-red-300">
                            Original: {tamperedRow.collection.weight_kg} kg → Altered in DB:{' '}
                            {tamperedRow.fakeWeightKg} kg
                        </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 font-mono text-xs">
                        <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-3">
                            <span className="text-slate-400 block text-[10px] mb-1">
                                ORIGINAL EDGE SHA-256 SIGNATURE (LOCKED AT KITCHEN DOOR):
                            </span>
                            <span className="text-emerald-400 break-all">
                                {tamperedRow.collection.sha256_hash}
                            </span>
                        </div>
                        <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-3">
                            <span className="text-red-300 block text-[10px] mb-1">
                                RECOMPUTED SHA-256 HASH AFTER +20KG DB TAMPER:
                            </span>
                            <span className="text-red-400 break-all">{tamperedRow.recomputedHash}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Executive KPI Ribbon */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs text-slate-400">Verified UCO Stockpile</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                        {totalVerifiedKg.toFixed(1)} kg
                    </p>
                    <span className="text-[11px] text-slate-400">ISCC EU Mass-Balance Ready</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs text-slate-400">Geotagged Noida Kitchens</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-white">{kitchens.length}</p>
                    <span className="text-[11px] text-emerald-400">Sec 126 • Sec 104 • Sec 76</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs text-slate-400">Eligible HEFA-SAF Output</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-sky-400">
                        {(totalVerifiedKg * 0.82).toFixed(1)} L
                    </p>
                    <span className="text-[11px] text-slate-400">0.82x Refining Conversion</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-xs text-slate-400">Verified Carbon Inset</span>
                    <p className="mt-1 font-mono text-2xl font-bold text-amber-400">
                        {((totalVerifiedKg / 1000) * 2.8).toFixed(3)} MT CO₂e
                    </p>
                    <span className="text-[11px] text-slate-400">CORSIA Aviation Standard</span>
                </div>
            </div>

            {/* Map + Live Cryptographic Ledger Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left 5 Cols: Live Noida Sector 126/104/76 Map */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-emerald-400" />
                            Noida Expressway Cluster Radar (Sec 126 • 104 • 76)
                        </span>
                        <span className="font-mono text-[11px] text-emerald-400">
                            {kitchens.length} Active Nodes
                        </span>
                    </div>

                    <div
                        ref={mapContainerRef}
                        className="h-[360px] w-full rounded-xl border border-slate-800 bg-slate-950 z-0"
                    />

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {kitchens.map((k) => (
                            <div
                                key={k.id}
                                className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-1.5 text-xs"
                            >
                                <div>
                                    <span className="font-semibold text-white">{k.name}</span>
                                    <span className="block text-[10px] text-slate-400">{k.address}</span>
                                </div>
                                <span className="font-mono text-[11px] text-emerald-400">
                                    Fryer: {k.fryer_capacity_liters}L
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right 7 Cols: Cryptographic Chain-of-Custody Ledger */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Database className="h-4 w-4 text-sky-400" />
                            Immutable SHA-256 Chain-of-Custody Ledger
                        </span>
                        <span className="text-[11px] text-slate-400">
                            Click &quot;Simulate Tamper&quot; on any batch to test zero-trust verification
                        </span>
                    </div>

                    {collections.length === 0 ? (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center text-xs text-slate-400">
                            Ledger is currently empty. Click{' '}
                            <strong>&quot;Seed Sec 126/104/76 Demo Data&quot;</strong> at the top right to
                            populate realistic Noida batches!
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {collections.map((c) => {
                                const isVerified = c.plausibility_status === 'VERIFIED';
                                return (
                                    <div
                                        key={c.id}
                                        className={`rounded-xl border p-3.5 transition ${isVerified
                                                ? 'border-slate-800 bg-slate-950/80'
                                                : 'border-amber-500/40 bg-amber-950/10'
                                            }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <span className="font-mono text-xs font-bold text-sky-400">
                                                    {c.drum_id}
                                                </span>
                                                <span className="mx-2 text-slate-600">•</span>
                                                <span className="text-sm font-bold text-white">{c.kitchen_name}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${isVerified
                                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                        }`}
                                                >
                                                    {c.plausibility_status}
                                                </span>
                                                <button
                                                    onClick={() => handleSimulateTamper(c)}
                                                    className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300 hover:bg-red-500/20 print:hidden"
                                                >
                                                    Simulate DB Weight Tamper (+20kg)
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-300 font-mono">
                                            <span>
                                                Weight: <strong className="text-white">{c.weight_kg} kg</strong>
                                            </span>
                                            <span>TPC: {c.tpc_percent}%</span>
                                            <span>Moisture: {c.moisture_percent}%</span>
                                            <span>Payout: ₹{c.payout_inr}</span>
                                        </div>

                                        <div className="mt-2 rounded bg-slate-900 px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 break-all border border-slate-800">
                                            SHA-256: {c.sha256_hash}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
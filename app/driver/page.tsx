'use client';

import { useEffect, useState } from 'react';
import { supabase, Kitchen } from '@/lib/supabase';
import { evaluatePlausibility, generateSHA256 } from '@/lib/crypto';
import {
    Truck,
    QrCode,
    Camera,
    Cpu,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Hash,
} from 'lucide-react';

export default function DriverCollectorPage() {
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [selectedKitchenId, setSelectedKitchenId] = useState<string>('');
    const [drumId, setDrumId] = useState<string>('DRM-NOIDA-S126-01');
    const [weightKg, setWeightKg] = useState<number>(32);
    const [tpcPercent, setTpcPercent] = useState<number>(26.8);
    const [moisturePercent, setMoisturePercent] = useState<number>(0.6);
    const [photoName, setPhotoName] = useState<string>('scale_sec126_verified.jpg');
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [collectorGps, setCollectorGps] = useState<string>('28.5442, 77.3340 (Sec-126 Lock)');

    const [sealedResult, setSealedResult] = useState<{
        hash: string;
        canonicalJson: string;
        status: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const drumParam = params.get('drum');
            if (drumParam) setDrumId(drumParam);
        }

        async function loadKitchens() {
            const { data } = await supabase
                .from('kitchens')
                .select('*')
                .order('created_at', { ascending: false });
            if (data && data.length > 0) {
                setKitchens(data);
                setSelectedKitchenId(data[0].id);
                setCollectorGps(`${data[0].lat}, ${data[0].lng}`);
            }
        }
        loadKitchens();
    }, []);

    const currentKitchen = kitchens.find((k) => k.id === selectedKitchenId);
    const fryerCap = currentKitchen?.fryer_capacity_liters || 40;
    const plausibility = evaluatePlausibility(weightKg, fryerCap, tpcPercent, moisturePercent);
    const payoutInr = Math.round(weightKg * 36);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoName(`${file.name} (${Math.round(file.size / 1024)}KB)`);
        const url = URL.createObjectURL(file);
        setPhotoPreview(url);
    };

    const handleSealAndHash = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentKitchen) {
            alert('Please onboard a kitchen in 1. Kitchen Portal first!');
            return;
        }
        setSubmitting(true);

        const payload = {
            kitchen_id: currentKitchen.id,
            kitchen_name: currentKitchen.name,
            fssai_number: currentKitchen.fssai_number,
            drum_id: drumId,
            weight_kg: Number(weightKg),
            tpc_percent: Number(tpcPercent),
            moisture_percent: Number(moisturePercent),
            photo_evidence: photoName,
            collector_gps: collectorGps,
            timestamp: new Date().toISOString(),
        };

        const { canonicalJson, hash } = await generateSHA256(payload);

        const { error } = await supabase.from('collections').insert([
            {
                kitchen_id: currentKitchen.id,
                kitchen_name: currentKitchen.name,
                drum_id: drumId,
                weight_kg: Number(weightKg),
                tpc_percent: Number(tpcPercent),
                moisture_percent: Number(moisturePercent),
                payout_inr: payoutInr,
                plausibility_status: plausibility.status,
                payload_json: canonicalJson,
                sha256_hash: hash,
                collector_gps: collectorGps,
            },
        ]);

        setSubmitting(false);
        if (!error) {
            setSealedResult({ hash, canonicalJson, status: plausibility.status });
        } else {
            alert('Error saving batch: ' + error.message);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header & Demo Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Truck className="h-6 w-6 text-sky-400" />
                        Edge Collector & SHA-256 Batch Sealer
                    </h1>
                    <p className="text-xs text-slate-400">
                        Noida Sector 126 • 104 • 76 Doorstep Pickup & Cryptographic Chain-of-Custody
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const sectors = ['S126', 'S104', 'S76'];
                            const pick = sectors[Math.floor(Math.random() * sectors.length)];
                            setDrumId(`DRM-NOIDA-${pick}-0${Math.floor(Math.random() * 9 + 1)}`);
                            setWeightKg(28.5);
                            setTpcPercent(27.2);
                            setMoisturePercent(0.5);
                            setSealedResult(null);
                        }}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
                    >
                        Demo: Valid Pickup
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setDrumId('DRM-FRAUD-S104-99');
                            setWeightKg(140);
                            setTpcPercent(14.0);
                            setMoisturePercent(0.8);
                            setSealedResult(null);
                        }}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20"
                    >
                        Demo: Over-Capacity Fraud
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSealAndHash}
                className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
                {/* NFC / QR Drum Tag Bar */}
                <div className="flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5">
                    <div className="flex items-center gap-3">
                        <QrCode className="h-6 w-6 text-sky-400" />
                        <div>
                            <span className="text-[11px] text-slate-400 block">ACTIVE NFC / QR DRUM SEAL</span>
                            <input
                                value={drumId}
                                onChange={(e) => setDrumId(e.target.value)}
                                className="bg-transparent font-mono text-base font-bold text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const sectors = ['S126', 'S104', 'S76'];
                            const pick = sectors[Math.floor(Math.random() * sectors.length)];
                            setDrumId(`DRM-NOIDA-${pick}-${Math.floor(10 + Math.random() * 89)}`);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                    >
                        Scan Next Tag
                    </button>
                </div>

                {/* Kitchen Selector */}
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                        Select Geotagged Kitchen (Point of Origin)
                    </label>
                    <select
                        value={selectedKitchenId}
                        onChange={(e) => {
                            setSelectedKitchenId(e.target.value);
                            const k = kitchens.find((item) => item.id === e.target.value);
                            if (k) setCollectorGps(`${k.lat}, ${k.lng}`);
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                    >
                        {kitchens.length === 0 ? (
                            <option value="">No kitchens found — onboard one in /kitchen first</option>
                        ) : (
                            kitchens.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.name} — {k.address} (Fryer: {k.fryer_capacity_liters}L)
                                </option>
                            ))
                        )}
                    </select>
                    {currentKitchen && (
                        <div className="mt-1.5 flex flex-wrap justify-between text-[11px] font-mono text-slate-400">
                            <span>FSSAI: {currentKitchen.fssai_number}</span>
                            <span>GPS: {collectorGps}</span>
                            <span className="text-emerald-400">
                                Max Plausible Weekly UCO: {plausibility.maxAllowedKg} kg
                            </span>
                        </div>
                    )}
                </div>

                {/* Weight & Quality Telemetry */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-xs text-slate-300 mb-1">Net Scale Weight (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={weightKg}
                            onChange={(e) => setWeightKg(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base font-bold text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-300 mb-1">TPC % (FSSAI &gt;25%)</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={tpcPercent}
                            onChange={(e) => setTpcPercent(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-300 mb-1">Moisture MIU % (&lt;2%)</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={moisturePercent}
                            onChange={(e) => setMoisturePercent(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base text-white"
                        />
                    </div>
                </div>

                {/* IoT Funnel Simulation Bar */}
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <Cpu className="h-4 w-4 text-sky-400" /> ESP32 Smart Funnel Telemetry
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setTpcPercent(Number((25.5 + Math.random() * 4).toFixed(1)));
                            setMoisturePercent(Number((0.4 + Math.random() * 0.6).toFixed(2)));
                        }}
                        className="text-sky-400 hover:underline font-medium"
                    >
                        Simulate Sensor Readout
                    </button>
                </div>

                {/* Camera Upload */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                        Live Scale & Drum Photo Evidence
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 py-4 text-xs text-slate-300 hover:border-sky-500/50">
                        <Camera className="h-4 w-4 text-sky-400" />
                        <span>Tap to Open Camera / Attach Scale Photo ({photoName})</span>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                    </label>
                    {photoPreview && (
                        <img
                            src={photoPreview}
                            alt="Scale preview"
                            className="h-28 w-full rounded-lg object-cover border border-slate-800"
                        />
                    )}
                </div>

                {/* Plausibility Status Card */}
                <div
                    className={`rounded-xl border p-3.5 text-xs ${plausibility.status === 'VERIFIED'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        }`}
                >
                    <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                            {plausibility.status === 'VERIFIED' ? (
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                            )}
                            PLAUSIBILITY STATUS: {plausibility.status}
                        </span>
                        <span className="font-mono text-sm">Instant UPI Payout: ₹{payoutInr}</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-90">{plausibility.reason}</p>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                >
                    {submitting
                        ? 'Computing SHA-256 Digest...'
                        : 'Seal Drum & Generate Immutable SHA-256 Hash'}
                </button>
            </form>

            {/* SHA-256 Cryptographic Receipt */}
            {sealedResult && (
                <div className="rounded-2xl border border-emerald-500/50 bg-slate-900 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        Batch Cryptographically Sealed & Anchored to Supabase Ledger
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Hash className="h-3.5 w-3.5" /> 64-CHARACTER SHA-256 HEX DIGEST:
                        </span>
                        <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400 break-all border border-emerald-500/30">
                            {sealedResult.hash}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-mono text-slate-400">CANONICAL JSON PAYLOAD:</span>
                        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] text-slate-300 border border-slate-800">
                            {sealedResult.canonicalJson}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
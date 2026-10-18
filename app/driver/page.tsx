'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Kitchen } from '@/lib/supabase';
import { evaluatePlausibility, generateSHA256 } from '@/lib/crypto';
import {
    Menu,
    Truck,
    MapPin,
    Navigation,
    Camera,
    CheckCircle2,
    Scale,
    IndianRupee,
    LogOut,
    AlertCircle,
    Factory,
    ArrowLeft,
} from 'lucide-react';

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export default function DriverEnterprisePortal() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeScreen, setActiveScreen] = useState<'route' | 'fill-data' | 'dropoff'>('route');

    const [driverName, setDriverName] = useState('Ramesh Kumar');
    const [driverVehicle, setDriverVehicle] = useState('UP16 AB 4921');
    const [aggregatorId, setAggregatorId] = useState<string | null>(null);
    const [aggregatorName, setAggregatorName] = useState('Provene Direct Fleet');

    const [routeKitchens, setRouteKitchens] = useState<Kitchen[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
    const [runCollectedKg, setRunCollectedKg] = useState<number>(0);

    const [checkingGps, setCheckingGps] = useState(false);
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
    const [gpsError, setGpsError] = useState<string>('');

    const [drumId, setDrumId] = useState<string>('DRUM-101');
    const [weightKg, setWeightKg] = useState<string>('');
    const [oilCondition, setOilCondition] = useState<'GOOD' | 'WATER_MIXED'>('GOOD');
    const [photoName, setPhotoName] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [dropOffDone, setDropOffDone] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<unknown>(null);

    useEffect(() => {
        setDrumId(`DRUM-${Math.floor(100 + Math.random() * 900)}`);

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('provene_session');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.name) setDriverName(parsed.name);
                    if (parsed.vehicle_number) setDriverVehicle(parsed.vehicle_number);
                    if (parsed.aggregator_id) setAggregatorId(parsed.aggregator_id);
                    if (parsed.aggregator_name) setAggregatorName(parsed.aggregator_name);
                } catch {
                    // ignore
                }
            }

            const savedDone = sessionStorage.getItem('provene_driver_completed');
            if (savedDone) {
                try {
                    setCompletedIds(JSON.parse(savedDone));
                } catch {
                    // ignore
                }
            }
        }

        async function loadRoute() {
            const { data } = await supabase
                .from('kitchens')
                .select('*')
                .order('pickup_requested', { ascending: false });
            if (data) {
                setRouteKitchens(data);
                if (data.length > 0) setSelectedKitchen(data[0]);
            }
        }
        loadRoute();
    }, []);

    const remainingKitchens = routeKitchens.filter((k) => !completedIds.includes(k.id));

    useEffect(() => {
        if (
            activeScreen !== 'route' ||
            !selectedKitchen ||
            typeof window === 'undefined' ||
            !mapContainerRef.current
        )
            return;

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

            const map = L.map(mapContainerRef.current).setView(
                [selectedKitchen.lat, selectedKitchen.lng],
                15
            );
            mapInstanceRef.current = map;

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
                maxZoom: 19,
            }).addTo(map);

            const marker = L.circleMarker([selectedKitchen.lat, selectedKitchen.lng], {
                radius: 10,
                fillColor: '#0ea5e9',
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.95,
            }).addTo(map);

            marker
                .bindPopup(
                    `<div style="color:#0f172a;font-family:sans-serif;font-size:12px;">
            <strong>${selectedKitchen.name}</strong><br/>
            ${selectedKitchen.address}
          </div>`
                )
                .openPopup();
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
    }, [activeScreen, selectedKitchen]);

    const handleVerify200mAndOpenForm = (kitchen: Kitchen) => {
        setGpsError('');
        setDistanceMeters(null);

        if (!navigator.geolocation) {
            setGpsError('Geolocation unavailable.');
            return;
        }

        setCheckingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCheckingGps(false);
                const dist = getDistanceInMeters(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    kitchen.lat,
                    kitchen.lng
                );
                setDistanceMeters(dist);

                if (dist <= 200) {
                    setSelectedKitchen(kitchen);
                    setActiveScreen('fill-data');
                } else {
                    setGpsError(
                        `GPS distance is ${dist}m from ${kitchen.name}. Must be within 200m of outlet to unlock manifest entry.`
                    );
                }
            },
            () => {
                setCheckingGps(false);
                setGpsError('GPS signal blocked on device. Use doorstep override below to test.');
            }
        );
    };

    const handleSavePickup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKitchen) return;
        const numericWeight = Number(weightKg) || 0;
        if (numericWeight <= 0) return;

        setSubmitting(true);

        const tpcPercent = 27.0;
        const moisturePercent = oilCondition === 'GOOD' ? 0.5 : 3.5;
        const payoutInr = Math.round(numericWeight * 36);
        const plausibility = evaluatePlausibility(
            numericWeight,
            selectedKitchen.fryer_capacity_liters || 50,
            tpcPercent,
            moisturePercent
        );

        const payload = {
            kitchen_id: selectedKitchen.id,
            kitchen_name: selectedKitchen.name,
            drum_id: drumId,
            weight_kg: numericWeight,
            driver_name: driverName,
            aggregator_name: aggregatorName,
            timestamp: new Date().toISOString(),
        };

        const { canonicalJson, hash } = await generateSHA256(payload);

        const { error } = await supabase.from('collections').insert([
            {
                kitchen_id: selectedKitchen.id,
                kitchen_name: selectedKitchen.name,
                drum_id: drumId,
                weight_kg: numericWeight,
                tpc_percent: tpcPercent,
                moisture_percent: moisturePercent,
                payout_inr: payoutInr,
                plausibility_status: plausibility.status,
                payload_json: canonicalJson,
                sha256_hash: hash,
                collector_gps: `${selectedKitchen.lat}, ${selectedKitchen.lng}`,
                driver_name: driverName,
                aggregator_id: aggregatorId,
                aggregator_name: aggregatorName,
            },
        ]);

        await supabase
            .from('kitchens')
            .update({ pickup_requested: false, pickup_eta: null })
            .eq('id', selectedKitchen.id);

        setSubmitting(false);

        if (!error) {
            const updatedDone = [...completedIds, selectedKitchen.id];
            setCompletedIds(updatedDone);
            sessionStorage.setItem('provene_driver_completed', JSON.stringify(updatedDone));
            setRunCollectedKg((prev) => prev + numericWeight);

            setWeightKg('');
            setPhotoName('');
            setDrumId(`DRUM-${Math.floor(100 + Math.random() * 900)}`);
            setDistanceMeters(null);
            setGpsError('');

            const nextRemaining = routeKitchens.filter((k) => !updatedDone.includes(k.id));
            setSelectedKitchen(nextRemaining[0] || null);
            setActiveScreen('route');
        } else {
            alert(error.message);
        }
    };

    const driverTotalPayout = Math.round(250 + completedIds.length * 40 + runCollectedKg * 4);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
            {/* LEFT COLLAPSIBLE SIDEBAR */}
            <aside
                className={`${sidebarOpen ? 'w-60' : 'w-16'
                    } shrink-0 border-r border-slate-800/80 bg-[#0b101b] flex flex-col justify-between transition-all duration-200`}
            >
                <div>
                    <div className="flex h-14 items-center gap-2.5 border-b border-slate-800/80 px-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-slate-950">
                            <Truck className="h-4 w-4" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <span className="text-xs font-extrabold text-white block truncate">
                                    {driverName}
                                </span>
                                <span className="text-[10px] font-mono text-sky-400 block truncate">
                                    {aggregatorName}
                                </span>
                            </div>
                        )}
                    </div>

                    <nav className="p-2.5 space-y-1">
                        <button
                            onClick={() => setActiveScreen('route')}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeScreen === 'route'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 shrink-0" />
                                {sidebarOpen && <span>Assigned Route</span>}
                            </div>
                            {sidebarOpen && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                    {remainingKitchens.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveScreen('dropoff')}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${activeScreen === 'dropoff'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                        >
                            <Factory className="h-4 w-4 shrink-0" />
                            {sidebarOpen && <span>Drop-Off Terminal</span>}
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
                        {sidebarOpen && <span>End Shift / Logout</span>}
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
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                            Shift Manifest • Vehicle {driverVehicle}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[10px] uppercase text-slate-400 block">Shift Payout</span>
                            <span className="font-mono text-sm font-bold text-emerald-400">
                                ₹{driverTotalPayout}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Top Telemetry Strip */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                                <IndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Shift Earnings
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                                ₹{driverTotalPayout}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Pending Stops
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-white">
                                {remainingKitchens.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Vehicle Load
                            </span>
                            <p className="mt-1 font-mono text-2xl font-bold text-sky-400">
                                {runCollectedKg.toFixed(1)} kg
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                            <span className="text-[11px] font-semibold uppercase text-slate-400">
                                Designated Drop-Off
                            </span>
                            <p className="mt-1 text-xs font-bold text-amber-400 truncate">
                                {aggregatorName === 'Provene Direct Fleet'
                                    ? 'Provene Hub Sec-126'
                                    : aggregatorName}
                            </p>
                        </div>
                    </div>

                    {activeScreen === 'route' && (
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0d1322] p-4 space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                                    Assigned Pickup Queue ({remainingKitchens.length})
                                </h2>

                                {remainingKitchens.length === 0 ? (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-3">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                                        <p className="text-sm font-bold text-white">All Route Stops Completed</p>
                                        <button
                                            onClick={() => setActiveScreen('dropoff')}
                                            className="w-full rounded-lg bg-amber-500 py-2.5 text-xs font-bold text-slate-950"
                                        >
                                            Proceed to Drop-Off Terminal →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                        {remainingKitchens.map((k, idx) => {
                                            const active = selectedKitchen?.id === k.id;
                                            return (
                                                <div
                                                    key={k.id}
                                                    onClick={() => {
                                                        setSelectedKitchen(k);
                                                        setGpsError('');
                                                        setDistanceMeters(null);
                                                    }}
                                                    className={`cursor-pointer rounded-lg border p-3.5 transition ${active
                                                        ? 'border-sky-500 bg-sky-950/25'
                                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-[10px] font-bold text-sky-400">
                                                            STOP #{idx + 1}
                                                        </span>
                                                        {k.pickup_requested && (
                                                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                                                PRIORITY
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-white mt-0.5">{k.name}</p>
                                                    <p className="text-xs text-slate-400">{k.address}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0d1322] p-4 space-y-4">
                                {selectedKitchen ? (
                                    <>
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                            <div>
                                                <h3 className="text-base font-bold text-white">{selectedKitchen.name}</h3>
                                                <p className="text-xs text-slate-400">{selectedKitchen.address}</p>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedKitchen.lat},${selectedKitchen.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                                            >
                                                <Navigation className="h-3.5 w-3.5" /> Open Google Maps
                                            </a>
                                        </div>

                                        <div
                                            ref={mapContainerRef}
                                            className="h-[290px] w-full rounded-lg border border-slate-800 bg-slate-950 z-0 [&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-95 [&_.leaflet-tile-pane]:contrast-90"
                                        />

                                        {gpsError && (
                                            <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 space-y-2 text-xs text-amber-200">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                                    <span>{gpsError}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDistanceMeters(30);
                                                        setGpsError('');
                                                        setActiveScreen('fill-data');
                                                    }}
                                                    className="rounded border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300"
                                                >
                                                    Simulate Doorstep Arrival (30m) →
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            disabled={checkingGps}
                                            onClick={() => handleVerify200mAndOpenForm(selectedKitchen)}
                                            className="w-full rounded-lg bg-sky-500 py-3.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
                                        >
                                            {checkingGps
                                                ? 'Verifying GPS Proximity (<200m)...'
                                                : `Arrived at ${selectedKitchen.name} — Log Oil Pickup`}
                                        </button>
                                    </>
                                ) : (
                                    <div className="py-16 text-center text-xs text-slate-500">
                                        No active stops remaining.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeScreen === 'fill-data' && selectedKitchen && (
                        <div className="mx-auto max-w-lg rounded-xl border border-slate-800/90 bg-[#0d1322] p-6 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <span className="text-[10px] font-mono uppercase text-emerald-400">
                                        ✓ GPS Proximity Verified ({distanceMeters ?? 30}m)
                                    </span>
                                    <h2 className="text-base font-bold text-white">{selectedKitchen.name}</h2>
                                </div>
                                <button
                                    onClick={() => setActiveScreen('route')}
                                    className="flex items-center gap-1 rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                                </button>
                            </div>

                            <form onSubmit={handleSavePickup} className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-300 mb-1 flex items-center gap-1.5">
                                        <Scale className="h-4 w-4 text-emerald-400" /> Net Oil Weight on Scale (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        required
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        placeholder="e.g. 28.5"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-base font-bold text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-300 mb-1">Drum Seal ID</label>
                                        <input
                                            value={drumId}
                                            onChange={(e) => setDrumId(e.target.value)}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sky-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 mb-1">Visual Check</label>
                                        <select
                                            value={oilCondition}
                                            onChange={(e) => setOilCondition(e.target.value as 'GOOD' | 'WATER_MIXED')}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                        >
                                            <option value="GOOD">✓ Standard Used Oil</option>
                                            <option value="WATER_MIXED">⚠ High Water / Sludge</option>
                                        </select>
                                    </div>
                                </div>

                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950 py-3.5 text-slate-300 hover:border-sky-400">
                                    <Camera className="h-4 w-4 text-sky-400" />
                                    <span>{photoName ? `Attached: ${photoName}` : 'Attach Scale Photo'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
                                        className="hidden"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-lg bg-emerald-500 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                                >
                                    {submitting ? 'Sealing Manifest...' : 'Confirm & Lock Pickup Entry'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeScreen === 'dropoff' && (
                        <div className="mx-auto max-w-lg rounded-xl border border-slate-800/90 bg-[#0d1322] p-6 space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                <Factory className="h-6 w-6 text-amber-400" />
                                <div>
                                    <span className="text-[10px] font-mono uppercase text-amber-400">
                                        Designated Unloading Facility
                                    </span>
                                    <h2 className="text-base font-bold text-white">
                                        {aggregatorName === 'Provene Direct Fleet'
                                            ? 'Provene Central Aggregation Hub — Sector 126'
                                            : `${aggregatorName} — Refinery Intake Terminal`}
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block">Total Oil in Vehicle</span>
                                    <span className="font-mono text-lg font-bold text-sky-400">
                                        {runCollectedKg.toFixed(1)} kg
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Settlement Due</span>
                                    <span className="font-mono text-lg font-bold text-emerald-400">
                                        ₹{driverTotalPayout}
                                    </span>
                                </div>
                            </div>

                            <a
                                href="https://www.google.com/maps/dir/?api=1&destination=28.5442,77.3340"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 py-3 text-xs font-bold text-sky-300"
                            >
                                <Navigation className="h-4 w-4" /> Navigate to Unloading Bay
                            </a>

                            {dropOffDone ? (
                                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4 text-center text-xs text-emerald-300 font-semibold">
                                    ✓ Handover Confirmed • Shift Payout Released
                                </div>
                            ) : (
                                <button
                                    onClick={() => setDropOffDone(true)}
                                    className="w-full rounded-lg bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400"
                                >
                                    Confirm Final Drum Handover
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
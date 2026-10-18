'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, Kitchen, Collection } from '@/lib/supabase';
import {
  ShieldCheck,
  Database,
  Printer,
  MapPin,
} from 'lucide-react';

export default function AuditCommandCenterPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    async function loadAllData() {
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
    loadAllData();
  }, []);

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

      const map = L.map(mapContainerRef.current).setView([28.5505, 77.361], 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      kitchens.forEach((k) => {
        bounds.push([k.lat, k.lng]);
        const marker = L.circleMarker([k.lat, k.lng], {
          radius: 10,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.95,
        }).addTo(map);

        marker.bindPopup(
          `<div style="color:#0f172a;font-family:sans-serif;font-size:12px;">
            <strong>${k.name}</strong><br/>
            ${k.address}<br/>
            <span>FSSAI: ${k.fssai_number}</span>
          </div>`
        );
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
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

  const totalCollectedKg = collections.reduce(
    (sum, item) => sum + Number(item.weight_kg || 0),
    0
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
              NOIDA OPERATIONS COMMAND CENTER (SECTOR 126 • 104 • 76)
            </h2>
            <p className="text-xs opacity-90">
              Live tracking of all partner restaurants and verified used oil pickups.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 print:hidden"
        >
          <Printer className="h-3.5 w-3.5" /> Print Summary Report
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Total Oil Collected</span>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {totalCollectedKg.toFixed(1)} kg
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Partner Restaurants</span>
          <p className="mt-1 text-2xl font-bold text-white">{kitchens.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Biofuel Yield</span>
          <p className="mt-1 text-2xl font-bold text-sky-400">
            {(totalCollectedKg * 0.82).toFixed(1)} L
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <span className="text-xs text-slate-400">Total Pickups</span>
          <p className="mt-1 text-2xl font-bold text-amber-400">{collections.length}</p>
        </div>
      </div>

      {/* Map + Recent Pickups Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" />
              Noida Partner Map (Sec 126 • 104 • 76)
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {kitchens.length} Outlets
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="h-[360px] w-full rounded-xl border border-slate-800 bg-slate-950 z-0 [&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-95 [&_.leaflet-tile-pane]:contrast-90"
          />
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Database className="h-4 w-4 text-sky-400" />
            Recent Oil Pickups
          </span>

          {collections.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center text-xs text-slate-400">
              No oil pickups logged yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {collections.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-sky-400">{c.drum_id}</span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="font-bold text-white text-sm">{c.kitchen_name}</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(c.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400 block">
                      {c.weight_kg} kg
                    </span>
                    <span className="text-slate-400">Paid: ₹{c.payout_inr}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
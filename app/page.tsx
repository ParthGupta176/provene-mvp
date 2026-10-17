'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Store,
  Truck,
  Activity,
  ArrowRight,
  Plane,
  FileCheck2,
  Cpu,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    kitchenCount: 0,
    totalUcoKg: 0,
    verifiedBatches: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const { data: kitchens } = await supabase.from('kitchens').select('id');
      const { data: collections } = await supabase
        .from('collections')
        .select('weight_kg, plausibility_status');

      const verified = (collections || []).filter(
        (c) => c.plausibility_status === 'VERIFIED'
      );
      const totalKg = verified.reduce((acc, row) => acc + Number(row.weight_kg || 0), 0);

      setStats({
        kitchenCount: kitchens?.length || 0,
        totalUcoKg: Number(totalKg.toFixed(1)),
        verifiedBatches: verified.length,
      });
    }
    loadStats();
  }, []);

  const safLiters = (stats.totalUcoKg * 0.82).toFixed(1);
  const co2SavedKg = (stats.totalUcoKg * 2.8).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 md:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <MapPin className="h-3.5 w-3.5" />
            Live Pilot: Noida Expressway Cluster (Sector 126 • Sector 104 • Sector 76)
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Zero-Trust Cryptographic Traceability for{' '}
            <span className="text-emerald-400">Circular Bio-Feedstock</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Provene eliminates black-market Used Cooking Oil (UCO) adulteration by anchoring
            every kitchen pickup with browser-native <strong>SHA-256 hashes</strong>,{' '}
            <strong>fryer-capacity plausibility checks</strong>, and automated{' '}
            <strong>FSSAI RUCO & ISCC EU Point-of-Origin</strong> compliance dossiers.
          </p>
        </div>

        {/* Live Telemetry Strip */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Onboarded Noida FBOs</p>
            <p className="mt-1 font-mono text-2xl font-bold text-white">
              {stats.kitchenCount}
            </p>
            <p className="mt-1 text-[11px] text-emerald-400">GPS & FSSAI Verified</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Verified UCO Aggregated</p>
            <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
              {stats.totalUcoKg} kg
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {stats.verifiedBatches} SHA-256 Sealed Batches
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Eligible HEFA-SAF Yield</p>
            <p className="mt-1 font-mono text-2xl font-bold text-sky-400">{safLiters} L</p>
            <p className="mt-1 text-[11px] text-slate-400">2027 1% Aviation Mandate</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Net Carbon Avoidance</p>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-400">
              {co2SavedKg} kg CO₂e
            </p>
            <p className="mt-1 text-[11px] text-slate-400">CORSIA / ISCC Standard</p>
          </div>
        </div>
      </div>

      {/* 3 Interactive Application Modules */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/kitchen"
          className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/60 hover:bg-slate-900"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/30">
                <Store className="h-6 w-6" />
              </span>
              <span className="font-mono text-xs text-slate-400">MODULE 01 // MOBILE</span>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-emerald-400">
              1. Kitchen Onboarding & RUCO Portal
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Onboard commercial kitchens in Sector 126, 104 & 76 with live GPS fencing,
              fryer capacity indexing, touch-screen ISCC declaration signature, and instant
              printable FSSAI RUCO disposal certificates.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            Launch Kitchen Portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/driver"
          className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/60 hover:bg-slate-900"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-sky-500/10 p-2.5 text-sky-400 border border-sky-500/30">
                <Truck className="h-6 w-6" />
              </span>
              <span className="font-mono text-xs text-slate-400">MODULE 02 // EDGE APP</span>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-sky-400">
              2. Edge Collector & SHA-256 Sealer
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scan NFC/QR drum tags (`DRM-NOIDA-S126-01`), capture scale weight and IoT
              sensor telemetry (TPC % & Moisture %), run live fryer plausibility checks, and
              seal batches with a 64-character SHA-256 hash.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-sky-400">
            Launch Driver Scanner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/audit"
          className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/60 hover:bg-slate-900"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/30">
                <Activity className="h-6 w-6" />
              </span>
              <span className="font-mono text-xs text-slate-400">MODULE 03 // DESKTOP</span>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-amber-400">
              3. Aggregator & SAF Command Center
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Live geospatial map of Noida Sector 126, 104 & 76 clusters, real-time
              cryptographic ledger, interactive database tamper simulator, and 1-click ISCC
              EU mass-balance audit dossier export.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-400">
            Open SAF Command Center <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Architecture Footer Cards */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-white">Anti-Dilution Plausibility Engine</h3>
            <p className="mt-1 text-xs text-slate-400">
              Automatically flags collection volumes exceeding 85% of a kitchen&apos;s indexed
              fryer capacity to prevent virgin palm oil mixing.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <Cpu className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-white">IoT Smart Funnel Ready</h3>
            <p className="mt-1 text-xs text-slate-400">
              Captures Total Polar Compounds (TPC &gt; 25%) and capacitive moisture (&lt; 2%)
              to reject water-adulterated batches at the doorstep.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
          <Plane className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-white">Dual Regulatory Compliance</h3>
            <p className="mt-1 text-xs text-slate-400">
              Generates FSSAI RUCO disposal logs for food operators alongside ISCC CORSIA
              Point-of-Origin proofs for bio-jet refiners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  AlertTriangle,
  CheckCircle2,
  Lock,
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
    <div className="space-y-16 pb-12 text-slate-900">
      {/* Force clean Light Mode background on the public home page */}
      <style>{`
        body {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <MapPin className="h-3.5 w-3.5" />
              Active Noida Pilot: Sector 126 • Sector 104 • Sector 76
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Turning Commercial Kitchen Waste Oil into{' '}
              <span className="text-emerald-600">Verified Aviation Biofuel.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              <strong>Provene</strong> is an asset-light circular supply-chain platform that
              aggregates Used Cooking Oil (UCO) from restaurants, hostels, and cloud kitchens. We
              replace unorganized scrap brokers with <strong>edge IoT quality testing</strong> and{' '}
              <strong>SHA-256 cryptographic traceability</strong>—delivering 100% audit-ready
              feedstock for Sustainable Aviation Fuel (SAF) refineries.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                Login to Partner Portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Live Pilot Telemetry Card */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Live Noida Ledger Telemetry
                </span>
                <p className="text-xs text-slate-500">Real-Time Cloud Database Metrics</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Onboarded Kitchens</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-slate-900">
                  {stats.kitchenCount}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">
                  GPS & FSSAI Indexed
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Verified UCO Diverted</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-emerald-600">
                  {stats.totalUcoKg} kg
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {stats.verifiedBatches} SHA-256 Batches
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Est. HEFA-SAF Biofuel</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-sky-600">
                  {safLiters} L
                </p>
                <p className="mt-1 text-[11px] text-slate-500">2027 1% Blending Mandate</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <p className="text-xs font-medium text-slate-500">CO₂e Emissions Saved</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-amber-600">
                  {co2SavedKg} kg
                </p>
                <p className="mt-1 text-[11px] text-slate-500">ISCC CORSIA Standard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM WE SOLVE */}
      <section id="problem" className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Why Provene Exists
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Solving India&apos;s Dual Waste-Oil & Clean Aviation Crisis
          </h2>
          <p className="text-sm text-slate-600">
            India generates 2.7 Million Metric Tons of Used Cooking Oil annually, yet the supply
            chain between commercial kitchens and biofuel refineries is completely broken.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
              <AlertTriangle className="h-4 w-4" />
              1. The Public Health & FSSAI Compliance Crisis
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              60%+ of Waste Oil Illegally Re-Enters the Human Food Chain
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Informal cash brokers buy dark, degraded oil from restaurants, bleach it with
              chemicals, and resell it to street vendors. Meanwhile, commercial kitchens face strict{' '}
              <strong>FSSAI RUCO mandates</strong> (Total Polar Compounds &gt; 25%) requiring
              verifiable disposal certificates they currently cannot obtain.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
              <Plane className="h-4 w-4" />
              2. The 2027 Aviation Biofuel (SAF) Traceability Bottleneck
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Refineries Reject Unverified Oil Due to Adulteration & Zero Proof-of-Origin
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Under international <strong>ISCC EU and CORSIA carbon mandates</strong>, biofuel
              refineries cannot purchase Used Cooking Oil unless every kilogram is cryptographically
              traced back to the exact restaurant fryer—preventing middlemen from mixing in water or
              virgin palm oil to inflate weight.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW PROVENE WORKS (4-STEP WORKFLOW) */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Zero-Trust Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            How Provene Secures Every Drop from Kitchen to Refinery
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 font-mono text-sm font-bold text-emerald-700">
              01
            </span>
            <h3 className="text-base font-bold text-slate-900">Geotagged Kitchen Indexing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kitchens register their 14-digit FSSAI license, exact GPS coordinates, and fryer
              capacity (Liters) with a digital ISCC self-declaration signature.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 font-mono text-sm font-bold text-sky-700">
              02
            </span>
            <h3 className="text-base font-bold text-slate-900">Doorstep Quality & Plausibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field collectors test Total Polar Compounds (&gt;25%) and Moisture (&lt;2%), while our
              algorithm blocks volumes exceeding 85% of the kitchen&apos;s fryer capacity.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 font-mono text-sm font-bold text-purple-700">
              03
            </span>
            <h3 className="text-base font-bold text-slate-900">SHA-256 Cryptographic Seal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The drum&apos;s QR tag, weight, GPS, and assay telemetry are hashed in the browser via{' '}
              <strong>SHA-256</strong>, making post-pickup weight tampering mathematically impossible.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 font-mono text-sm font-bold text-amber-700">
              04
            </span>
            <h3 className="text-base font-bold text-slate-900">Instant UPI & Dual Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restaurants receive instant UPI settlement (₹36/kg) and an official{' '}
              <strong>FSSAI RUCO Certificate</strong>, while refiners get an ISCC mass-balance audit
              dossier.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ROLE-BASED STAKEHOLDER PORTALS */}
      <section id="clusters" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Unified Multi-Stakeholder Platform
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Three Dedicated Portals. One Immutable Ledger.
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Lock className="h-4 w-4 text-emerald-400" />
            Go to Role-Based Login
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Store className="h-5 w-5" /> 1. Kitchen Partner Portal
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For restaurants, cloud kitchens, and hostel messes in <strong>Sector 126, 104 & 76</strong>.
                Onboard fryers, sign ISCC declarations, and download official FSSAI RUCO disposal
                certificates.
              </p>
            </div>
            <Link
              href="/login?role=kitchen"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              Login with Kitchen ID <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sky-700 font-bold text-sm">
                <Truck className="h-5 w-5" /> 2. Field Driver Collector App
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For doorstep collection agents. Scan NFC/QR drum tags, capture scale photos and
                IoT sensor metrics, verify fryer plausibility, and seal batches with SHA-256.
              </p>
            </div>
            <Link
              href="/login?role=driver"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:underline"
            >
              Login with Driver ID <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Activity className="h-5 w-5" /> 3. SAF Command Center
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For RUCO aggregators and refinery auditors. Monitor live Noida cluster maps, inspect
                SHA-256 signatures, detect database tampering, and export ISCC dossiers.
              </p>
            </div>
            <Link
              href="/login?role=audit"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
            >
              Login with Command Center ID <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Store,
  Truck,
  ShieldCheck,
  ArrowRight,
  Plane,
  MapPin,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Building2,
  Utensils,
  FileCheck,
  IndianRupee,
  Clock,
  Home,
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    kitchenCount: 0,
    totalUcoKg: 0,
    totalPickups: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const { data: kitchens } = await supabase.from('kitchens').select('id');
      const { data: collections } = await supabase
        .from('collections')
        .select('weight_kg');

      const totalKg = (collections || []).reduce(
        (acc, row) => acc + Number(row.weight_kg || 0),
        0
      );

      setStats({
        kitchenCount: kitchens?.length || 0,
        totalUcoKg: Number(totalKg.toFixed(1)),
        totalPickups: collections?.length || 0,
      });
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-20 pb-16 w-full">
        {/* 1. HERO SECTION */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                <MapPin className="h-3.5 w-3.5" />
                Serving in Delhi-NCR
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                We Turn Used Kitchen Oil into{' '}
                <span className="text-emerald-600">Clean Biofuel.</span>
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                <strong>Provene</strong> collects used cooking oil directly from restaurants, cloud
                kitchens, hostels, and residential households across Delhi-NCR. We provide doorstep
                weighing, instant payouts, and official <strong>FSSAI disposal ledgers</strong> for
                food businesses—ensuring every drop of waste oil is safely converted into clean
                biofuel instead of re-entering the food chain or polluting water systems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Doorstep Weighing & Pickup
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Instant Transparent Payouts
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Official FSSAI Disposal Records
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Portal Login <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#process"
                  className="rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* Live Impact Summary (Connected to Real Supabase Database) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Live Collection Telemetry
                  </span>
                  <p className="text-xs text-slate-500">Connected to live Provene database</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Registered Kitchens</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {stats.kitchenCount}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-emerald-600">
                    Active Locations
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Used Oil Collected</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                    {stats.totalUcoKg} kg
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {stats.totalPickups} Completed Pickups
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Clean Biofuel Yield</p>
                  <p className="mt-1 text-2xl font-extrabold text-sky-600">
                    {(stats.totalUcoKg * 0.82).toFixed(1)} L
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Green Fuel Equivalent</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Emissions Prevented</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-600">
                    {(stats.totalUcoKg * 2.8).toFixed(1)} kg
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">CO₂ Saved</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHY PROVENE */}
        <section id="about" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Our Mission
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Protecting Public Health & Powering Clean Energy
            </h2>
            <p className="text-sm text-slate-600">
              Thousands of liters of used frying oil are discarded or sold to unverified buyers
              every day. Provene builds a transparent, traceable collection network across
              Delhi-NCR.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
                <AlertTriangle className="h-4 w-4" />
                1. Stopping Illegal Oil Reuse & Water Contamination
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Keeping Used Frying Oil Out of Food Markets & Drains
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unregistered scrap buyers often collect old frying oil from restaurants and resell
                it back into street food markets, while household oil poured down kitchen sinks
                clogs drainage lines and pollutes water bodies. Provene ensures safe, verified
                collection from both food businesses and homes.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-7 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                <Plane className="h-4 w-4" />
                2. Supplying Clean, Verified Biofuel Refineries
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                100% Traceable Supply From Source to Refinery
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Biofuel plants require verified proof that used cooking oil came from genuine
                kitchens and wasn&apos;t adulterated with water or cheap oil. We weigh and record
                every pickup at the doorstep so biofuel aggregators and refineries receive pure,
                verified feedstock.
              </p>
            </div>
          </div>
        </section>

        {/* 3. WHO WE SERVE (Commercial + Residential Households) */}
        <section id="who-we-serve" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Who We Serve in Delhi-NCR
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Built for Commercial Kitchens & Residential Households
            </h2>
            <p className="text-sm text-slate-600">
              From high-volume restaurants and cloud kitchens to residential societies and
              households, Provene makes responsible oil disposal simple and rewarding.
            </p>
          </div>

          {/* 4-Card Establishments Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Restaurants & QSRs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doorstep drum collection, instant payouts per kg, and automated FSSAI disposal
                ledgers for dining outlets and fast-food chains.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cloud Kitchens</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast, scheduled or on-demand pickups when storage capacity reaches full, with zero
                disruption to kitchen operations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hostels, Hotels & Messes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reliable bulk collection for university hostels, corporate cafeterias, banquet
                halls, and institutional catering kitchens.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2.5 shadow-2xs">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Home className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Residential Households</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Helping families and residential societies safely recycle domestic used cooking oil
                instead of pouring it into household drains.
              </p>
            </div>
          </div>

          {/* Core Benefits Strip */}
          <div id="compliance" className="grid gap-6 md:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                Transparent Doorstep Payouts
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every pickup is weighed digitally at your location and settled immediately based on
                verified weight.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Clock className="h-4 w-4 text-sky-600" />
                On-Demand Pickup Scheduling
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Request a pickup through the portal whenever your oil storage is full and track
                estimated collection times.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <FileCheck className="h-4 w-4 text-amber-600" />
                1-Click FSSAI Disposal Ledger
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Commercial kitchens can filter by date and download their official FSSAI disposal
                records at any time.
              </p>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section id="process" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              How Provene Works
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 font-bold text-sm text-emerald-700">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">Account Onboarding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We register your kitchen or collection point into the Provene network and issue
                your dedicated portal Login ID.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 font-bold text-sm text-sky-700">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">GPS-Verified Doorstep Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our driver navigates to your location, verifies arrival within 200 meters, and
                weighs the used oil on a digital scale.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 font-bold text-sm text-purple-700">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900">Instant Settlement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Payment is calculated automatically by weight and settled immediately with zero
                middleman cuts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 font-bold text-sm text-amber-700">
                4
              </span>
              <h3 className="text-base font-bold text-slate-900">Ledger & Biofuel Offtake</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your pickup record is updated instantly in your portal while the sealed batch is
                delivered to certified biofuel buyers.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PORTALS OVERVIEW */}
        <section
          id="portals"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Role-Based Access
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Three Connected Portals for Kitchens, Drivers & Operations
              </h2>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Lock className="h-4 w-4 text-emerald-400" />
              Sign In to Portal
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Store className="h-5 w-5" /> 1. Kitchen Partner Portal
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Request urgent pickups when oil capacity is full, view scheduled arrival times,
                track completed collection history, and download date-wise FSSAI disposal ledgers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-sky-700 font-bold text-sm">
                <Truck className="h-5 w-5" /> 2. Driver Pickup App
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                View assigned pickup routes, open Google Maps navigation, verify doorstep proximity
                (&lt;200m), log locked oil weights, and complete drop-off handovers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-purple-700 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" /> 3. Provene Ops Hub
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Internal operations console to onboard kitchens, manage in-house and third-party
                aggregator drivers, monitor live inventory, and dispatch oil to buyers.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 6. CLEAN, FACTUAL FOOTER (Zero Fake Phones, Emails, or Copyright Claims) */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-12 text-xs">
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                PROVENE
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-md">
              Traceable Used Cooking Oil (UCO) collection network serving commercial kitchens and
              residential households across Delhi-NCR for clean biofuel conversion.
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <MapPin className="h-3.5 w-3.5" /> Serving in Delhi-NCR • Aligned with FSSAI RUCO
              Standards
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">Navigation</h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <a href="#about" className="hover:text-emerald-600">
                  Why Provene
                </a>
              </li>
              <li>
                <a href="#who-we-serve" className="hover:text-emerald-600">
                  Who We Serve
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-emerald-600">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-emerald-600">
                  FSSAI Compliance
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">Platform Access</h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/login" className="hover:text-emerald-600">
                  Kitchen Partner Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600">
                  Driver Pickup App
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-600">
                  Provene Ops Hub
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Store,
  Truck,
  Activity,
  ArrowRight,
  Plane,
  MapPin,
  AlertTriangle,
  Lock,
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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-16 pb-12 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <MapPin className="h-3.5 w-3.5" />
              Serving Noida: Sector 126 • Sector 104 • Sector 76
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              We Turn Used Kitchen Oil into{' '}
              <span className="text-emerald-600">Clean Biofuel.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              <strong>Provene</strong> partners with restaurants, cloud kitchens, and hostel messes
              to collect their used cooking oil right from their doorstep. We pay kitchens
              instantly, provide official <strong>FSSAI disposal records</strong>, and ensure every
              drop is safely recycled into clean green fuel instead of re-entering the food chain.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                Partner Login <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#process"
                className="rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Live Impact Summary */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Live Noida Collection Stats
                </span>
                <p className="text-xs text-slate-500">Updated in real time</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Partner Kitchens</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {stats.kitchenCount}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600">
                  Verified Outlets
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
                <p className="text-xs font-medium text-slate-500">Clean Biofuel Produced</p>
                <p className="mt-1 text-2xl font-extrabold text-sky-600">
                  {(stats.totalUcoKg * 0.82).toFixed(1)} L
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Green Fuel Equivalent</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Pollution Prevented</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-600">
                  {(stats.totalUcoKg * 2.8).toFixed(1)} kg
                </p>
                <p className="mt-1 text-[11px] text-slate-500">CO₂ Emissions Saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY PROVENE */}
      <section id="about" className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Our Mission
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Protecting Public Health & Powering Clean Energy
          </h2>
          <p className="text-sm text-slate-600">
            Every week, thousands of liters of used frying oil leave commercial kitchens without
            proper tracking. Provene makes safe oil disposal effortless and rewarding.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
              <AlertTriangle className="h-4 w-4" />
              1. Stopping Illegal Oil Reuse in Food
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Keeping Used Frying Oil Out of Local Food Markets
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unregistered scrap buyers often collect old frying oil and resell it back into local
              street food markets. Provene gives restaurants a trusted collection partner and
              official <strong>FSSAI disposal records</strong> for every pickup.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
              <Plane className="h-4 w-4" />
              2. Supplying Clean, Verified Biofuel Refineries
            </div>
            <p className="text-lg font-bold text-slate-900">
              100% Traceable Supply From Kitchen to Refinery
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Biofuel plants need proof that used oil came from real kitchens and wasn&apos;t mixed
              with water or cheap oil. We weigh and record every drum at the restaurant door so
              refineries get pure, verified oil.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
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
            <h3 className="text-base font-bold text-slate-900">Kitchen Registration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our team registers your restaurant, FSSAI number, and kitchen location into the
              Provene network.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 font-bold text-sm text-sky-700">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900">Doorstep Weighing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our pickup driver weighs your used oil at your doorstep and logs the weight and scale
              photo in our mobile app.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 font-bold text-sm text-purple-700">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900">Instant Payment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your restaurant receives instant payment per kilogram of oil collected, with zero
              middleman cuts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 font-bold text-sm text-amber-700">
              4
            </span>
            <h3 className="text-base font-bold text-slate-900">FSSAI Ledger Download</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log into your Restaurant Portal anytime to view your pickup dates, weights, and
              download your FSSAI disposal ledger.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PORTALS OVERVIEW */}
      <section id="portals" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Dedicated Access
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              One Platform for Restaurants, Drivers & Operations
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Lock className="h-4 w-4 text-emerald-400" />
            Login to Your Account
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Store className="h-5 w-5" /> 1. Restaurant Portal
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For partner restaurants to track how much oil was picked up, check collection dates
              and payments, and download official FSSAI disposal ledgers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Truck className="h-5 w-5" /> 2. Driver Pickup App
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A simple, fast mobile screen for collection drivers to select the restaurant, enter
              the oil weight, attach a scale photo, and save the pickup.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
            <div className="inline-flex items-center gap-2 text-amber-700 font-bold text-sm">
              <Activity className="h-5 w-5" /> 3. Operations Command Center
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For our operations team to view the live Noida map across Sector 126, 104, and 76 and
              monitor all daily oil collections.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Lock,
    UserCheck,
    Store,
    Truck,
    Activity,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const role = params.get('role');
            if (role === 'kitchen') {
                setLoginId('kitchen@provene.in');
                setPassword('kitchen123');
            } else if (role === 'driver') {
                setLoginId('driver@provene.in');
                setPassword('driver123');
            } else if (role === 'audit') {
                setLoginId('command@provene.in');
                setPassword('admin123');
            }
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanId = loginId.trim().toLowerCase();

        if (!cleanId || !password.trim()) {
            setError('Please enter both your Portal ID and Password.');
            return;
        }

        // 1. Check if Kitchen ID
        if (
            cleanId.includes('kitchen') ||
            cleanId.includes('fbo') ||
            cleanId.includes('rest') ||
            cleanId === 'k-126'
        ) {
            router.push('/kitchen');
            return;
        }

        // 2. Check if Driver ID
        if (
            cleanId.includes('driver') ||
            cleanId.includes('collect') ||
            cleanId.includes('truck') ||
            cleanId === 'd-104'
        ) {
            router.push('/driver');
            return;
        }

        // 3. Check if Command Center / Auditor ID
        if (
            cleanId.includes('command') ||
            cleanId.includes('admin') ||
            cleanId.includes('audit') ||
            cleanId.includes('ruco') ||
            cleanId.includes('saf')
        ) {
            router.push('/audit');
            return;
        }

        setError(
            'Unrecognized Portal ID. Use a Kitchen ID (kitchen@provene.in), Driver ID (driver@provene.in), or Command Center ID (command@provene.in).'
        );
    };

    return (
        <div className="mx-auto max-w-4xl py-8 text-slate-900">
            {/* Keep Login Page in Crisp Light Mode */}
            <style>{`
        body {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
      `}</style>

            <div className="grid gap-8 md:grid-cols-12 items-start">
                {/* Left 7 Cols: Main Login Form */}
                <div className="md:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                            Role-Based Zero-Trust Access
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            Sign in to Provene Portal
                        </h1>
                        <p className="text-xs text-slate-500">
                            Enter your assigned Kitchen ID, Driver ID, or Command Center ID to launch your
                            workspace.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Partner / Operator Login ID *
                            </label>
                            <div className="relative">
                                <UserCheck className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    required
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="e.g., kitchen@provene.in / driver@provene.in / command@provene.in"
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter portal password"
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Authenticate & Launch Portal <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                {/* Right 5 Cols: Quick Credentials Box for Live Demo */}
                <div className="md:col-span-5 rounded-3xl border border-slate-200 bg-slate-100/80 p-6 space-y-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Noida Pilot Credentials
                        </span>
                        <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                            Click Any ID to Auto-Fill
                        </h2>
                        <p className="text-xs text-slate-500">
                            Use these official pilot IDs during your presentation to switch between roles:
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Kitchen ID Card */}
                        <button
                            type="button"
                            onClick={() => {
                                setLoginId('kitchen@provene.in');
                                setPassword('kitchen123');
                                setError('');
                            }}
                            className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-emerald-500 hover:shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                    <Store className="h-4 w-4" /> 1. Kitchen Partner ID
                                </span>
                                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                    Routes to /kitchen
                                </span>
                            </div>
                            <p className="mt-1.5 font-mono text-xs text-slate-800">
                                ID: <strong>kitchen@provene.in</strong>
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">Pass: kitchen123</p>
                        </button>

                        {/* Driver ID Card */}
                        <button
                            type="button"
                            onClick={() => {
                                setLoginId('driver@provene.in');
                                setPassword('driver123');
                                setError('');
                            }}
                            className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-sky-500 hover:shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
                                    <Truck className="h-4 w-4" /> 2. Field Driver ID
                                </span>
                                <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                                    Routes to /driver
                                </span>
                            </div>
                            <p className="mt-1.5 font-mono text-xs text-slate-800">
                                ID: <strong>driver@provene.in</strong>
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">Pass: driver123</p>
                        </button>

                        {/* Command Center ID Card */}
                        <button
                            type="button"
                            onClick={() => {
                                setLoginId('command@provene.in');
                                setPassword('admin123');
                                setError('');
                            }}
                            className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-amber-500 hover:shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                    <Activity className="h-4 w-4" /> 3. Command Center ID
                                </span>
                                <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                    Routes to /audit
                                </span>
                            </div>
                            <p className="mt-1.5 font-mono text-xs text-slate-800">
                                ID: <strong>command@provene.in</strong>
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">Pass: admin123</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
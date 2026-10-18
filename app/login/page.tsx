'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    ShieldCheck,
    Lock,
    UserCheck,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanId = loginId.trim().toLowerCase();
        const cleanPass = password.trim();

        if (!cleanId || !cleanPass) {
            setError('Please enter both your Login ID and Password.');
            return;
        }

        setLoading(true);

        // 1. Founder Master Login
        if (
            (cleanId === 'founder@provene.in' || cleanId === 'master@provene.in') &&
            cleanPass === 'provene@2026'
        ) {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({ role: 'OPS_HUB', name: 'Parth Gupta (Founder)', login_id: cleanId })
            );
            router.push('/master');
            return;
        }

        // 2. Check Internal Company Employees Table -> Routes to Ops Hub (/master)
        const { data: empData } = await supabase
            .from('employees')
            .select('*')
            .ilike('login_id', cleanId)
            .eq('password', cleanPass)
            .maybeSingle();

        if (empData) {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({
                    role: 'OPS_HUB',
                    id: empData.id,
                    name: `${empData.name} (${empData.role})`,
                    login_id: empData.login_id,
                })
            );
            router.push('/master');
            return;
        }

        // 3. Check Onboarded Kitchens Table -> Routes to Restaurant Portal (/kitchen)
        const { data: kitchenData } = await supabase
            .from('kitchens')
            .select('*')
            .ilike('login_id', cleanId)
            .eq('password', cleanPass)
            .maybeSingle();

        if (kitchenData) {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({
                    role: 'KITCHEN',
                    id: kitchenData.id,
                    name: kitchenData.name,
                    login_id: kitchenData.login_id,
                })
            );
            router.push('/kitchen');
            return;
        }

        // Default fallback kitchen login
        if (cleanId === 'kitchen@provene.in' && cleanPass === 'kitchen123') {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({ role: 'KITCHEN', id: 'ALL', name: 'Partner Restaurant' })
            );
            router.push('/kitchen');
            return;
        }

        // 4. Check Onboarded Drivers Table -> Routes to Driver Portal (/driver)
        const { data: driverData } = await supabase
            .from('drivers')
            .select('*')
            .ilike('login_id', cleanId)
            .eq('password', cleanPass)
            .maybeSingle();

        if (driverData) {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({
                    role: 'DRIVER',
                    id: driverData.id,
                    name: driverData.name,
                    employment_type: driverData.employment_type,
                    aggregator_id: driverData.aggregator_id,
                    aggregator_name: driverData.aggregator_name,
                    login_id: driverData.login_id,
                })
            );
            router.push('/driver');
            return;
        }

        // Default fallback driver login
        if (cleanId === 'driver@provene.in' && cleanPass === 'driver123') {
            localStorage.setItem(
                'provene_session',
                JSON.stringify({
                    role: 'DRIVER',
                    name: 'Provene Fleet Driver',
                    employment_type: 'PROVENE_HIRED',
                    aggregator_name: 'Provene Direct Fleet',
                })
            );
            router.push('/driver');
            return;
        }

        setLoading(false);
        setError('Invalid Login ID or Password. Please check with Provene Ops Hub.');
    };

    return (
        <div className="mx-auto max-w-md py-14 text-slate-900">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                <div className="space-y-2 text-center">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                        Provene Portal Access
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                        Sign In to Your Account
                    </h1>
                    <p className="text-xs text-slate-500">
                        Enter your assigned Login ID and password to open your workspace.
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
                            Login ID *
                        </label>
                        <div className="relative">
                            <UserCheck className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                required
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                placeholder="Enter your Login ID"
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
                                placeholder="••••••••••••"
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Login'} <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  X,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Self-Service Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'VERIFY' | 'NEW_PASSWORD'>('VERIFY');
  const [resetLoginId, setResetLoginId] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [matchedRecord, setMatchedRecord] = useState<{
    table: 'kitchens' | 'drivers' | 'aggregators' | 'employees';
    id: string;
    name: string;
  } | null>(null);

  // Auto-open Reset Modal if navigated from Navbar (/login?mode=reset)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'reset') {
        setResetModalOpen(true);
      }
    }
  }, []);

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

    // 1. Founder Master Login -> Routes to /master
    const customFounderPass =
      typeof window !== 'undefined'
        ? localStorage.getItem('provene_founder_pass') || 'provene@2026'
        : 'provene@2026';

    if (
      (cleanId === 'founder@provene.in' || cleanId === 'master@provene.in') &&
      (cleanPass === customFounderPass || cleanPass === 'provene@2026')
    ) {
      localStorage.setItem(
        'provene_session',
        JSON.stringify({ role: 'FOUNDER', name: 'Parth Gupta (Founder)', login_id: cleanId })
      );
      router.push('/master');
      return;
    }

    // 2. Check Internal Company Employees Table -> Routes to /ops (or /master if Founder role)
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .ilike('login_id', cleanId)
      .eq('password', cleanPass)
      .maybeSingle();

    if (empData) {
      const isFounderRole = (empData.role || '').toLowerCase().includes('founder');
      localStorage.setItem(
        'provene_session',
        JSON.stringify({
          role: isFounderRole ? 'FOUNDER' : 'OPS_EMPLOYEE',
          id: empData.id,
          name: `${empData.name} (${empData.role})`,
          login_id: empData.login_id,
        })
      );
      router.push(isFounderRole ? '/master' : '/ops');
      return;
    }

    // Default fallback Ops Employee login
    if (cleanId === 'ops@provene.in' && cleanPass === 'ops123') {
      localStorage.setItem(
        'provene_session',
        JSON.stringify({
          role: 'OPS_EMPLOYEE',
          name: 'Operations Dispatcher',
          login_id: cleanId,
        })
      );
      router.push('/ops');
      return;
    }

    // 3. Check Onboarded Aggregators / Refinery Buyers Table -> Routes to /aggregator
    const { data: aggData } = await supabase
      .from('aggregators')
      .select('*')
      .ilike('login_id', cleanId)
      .eq('password', cleanPass)
      .maybeSingle();

    if (aggData) {
      localStorage.setItem(
        'provene_session',
        JSON.stringify({
          role: 'AGGREGATOR',
          id: aggData.id,
          name: aggData.company_name,
          contact_person: aggData.contact_person,
          login_id: aggData.login_id,
        })
      );
      router.push('/aggregator');
      return;
    }

    // Default fallback Aggregator login
    if (cleanId === 'aggregator@provene.in' && cleanPass === 'buyer123') {
      localStorage.setItem(
        'provene_session',
        JSON.stringify({
          role: 'AGGREGATOR',
          id: 'ALL',
          name: 'Biofuel Offtake Aggregator',
          login_id: cleanId,
        })
      );
      router.push('/aggregator');
      return;
    }

    // 4. Check Onboarded Kitchens Table -> Routes to Restaurant Portal (/kitchen)
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

    // 5. Check Onboarded Drivers Table -> Routes to Driver Portal (/driver)
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
          vehicle_number: driverData.vehicle_number,
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
    setError('Invalid Login ID or Password. Use Forgot Password below to reset.');
  };

  const openResetModal = () => {
    setResetError('');
    setResetSuccess('');
    setResetStep('VERIFY');
    setResetLoginId('');
    setResetPhone('');
    setNewPassword('');
    setConfirmPassword('');
    setMatchedRecord(null);
    setResetModalOpen(true);
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    const idToFind = resetLoginId.trim().toLowerCase();
    const phoneToFind = resetPhone.trim().replace(/\D/g, '');

    if (!idToFind || !phoneToFind) {
      setResetError('Please enter both your Login ID and Mobile Number.');
      return;
    }

    // 1. Check Kitchens
    const { data: kMatch } = await supabase
      .from('kitchens')
      .select('id, name, phone')
      .ilike('login_id', idToFind);
    const matchedK = kMatch?.find((k) => (k.phone || '').replace(/\D/g, '') === phoneToFind);
    if (matchedK) {
      setMatchedRecord({ table: 'kitchens', id: matchedK.id, name: matchedK.name });
      setResetStep('NEW_PASSWORD');
      return;
    }

    // 2. Check Drivers
    const { data: dMatch } = await supabase
      .from('drivers')
      .select('id, name, phone')
      .ilike('login_id', idToFind);
    const matchedD = dMatch?.find((d) => (d.phone || '').replace(/\D/g, '') === phoneToFind);
    if (matchedD) {
      setMatchedRecord({ table: 'drivers', id: matchedD.id, name: matchedD.name });
      setResetStep('NEW_PASSWORD');
      return;
    }

    // 3. Check Aggregators / Buyers
    const { data: aMatch } = await supabase
      .from('aggregators')
      .select('id, company_name, phone')
      .ilike('login_id', idToFind);
    const matchedA = aMatch?.find((a) => (a.phone || '').replace(/\D/g, '') === phoneToFind);
    if (matchedA) {
      setMatchedRecord({
        table: 'aggregators',
        id: matchedA.id,
        name: matchedA.company_name,
      });
      setResetStep('NEW_PASSWORD');
      return;
    }

    // 4. Check Employees
    const { data: eMatch } = await supabase
      .from('employees')
      .select('id, name, phone')
      .ilike('login_id', idToFind);
    const matchedE = eMatch?.find((emp) => (emp.phone || '').replace(/\D/g, '') === phoneToFind);
    if (matchedE) {
      setMatchedRecord({ table: 'employees', id: matchedE.id, name: matchedE.name });
      setResetStep('NEW_PASSWORD');
      return;
    }

    setResetError('No account found matching that Login ID and Mobile Number.');
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPassword.trim().length < 4) {
      setResetError('Password must be at least 4 characters.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setResetError('Passwords do not match.');
      return;
    }
    if (!matchedRecord) return;

    const { error: updateErr } = await supabase
      .from(matchedRecord.table)
      .update({ password: newPassword.trim() })
      .eq('id', matchedRecord.id);

    if (!updateErr) {
      setResetSuccess(`Password updated for ${matchedRecord.name}! You can now log in.`);
      setLoginId(resetLoginId.trim());
      setTimeout(() => {
        setResetModalOpen(false);
      }, 1800);
    } else {
      setResetError(updateErr.message);
    }
  };

  return (
    <div className="mx-auto max-w-md py-14 text-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Provene Portal Access
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In to Your Account</h1>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Login ID *</label>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password *</label>
              <button
                type="button"
                onClick={openResetModal}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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

        <div className="border-t border-slate-100 pt-4 text-center">
          <button
            type="button"
            onClick={openResetModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
            Reset Password via Login ID & Mobile No.
          </button>
        </div>
      </div>

      {/* SELF-SERVICE PASSWORD RESET MODAL */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Reset Portal Password</span>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {resetSuccess}
              </div>
            )}

            {resetStep === 'VERIFY' ? (
              <form onSubmit={handleVerifyIdentity} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Enter your assigned <strong>Login ID</strong> and{' '}
                  <strong>Registered Mobile Number</strong> to verify your account.
                </p>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Login ID *</label>
                  <input
                    required
                    value={resetLoginId}
                    onChange={(e) => setResetLoginId(e.target.value)}
                    placeholder="e.g. outlet@provene.in, driver@provene.in, buyer@provene.in"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Registered Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      required
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      placeholder="Enter registered mobile number"
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  Verify Account
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Identity verified for <strong>{matchedRecord?.name}</strong>. Enter your new
                  password below:
                </p>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700"
                >
                  Save New Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
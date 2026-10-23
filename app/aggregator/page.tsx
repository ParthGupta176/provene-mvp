'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Aggregator, Driver, Collection } from '@/lib/supabase';
import {
  Menu,
  Building2,
  Truck,
  Droplets,
  IndianRupee,
  Plus,
  Download,
  KeyRound,
  LogOut,
  X,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export default function AggregatorPortal() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fleet' | 'ledger'>('dashboard');

  const [aggregator, setAggregator] = useState<Aggregator | null>(null);
  const [assignedDrivers, setAssignedDrivers] = useState<Driver[]>([]);
  const [intakeBatches, setIntakeBatches] = useState<Collection[]>([]);
  const [toast, setToast] = useState('');

  // Add Driver Modal
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [dName, setDName] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dVehicle, setDVehicle] = useState('');
  const [dLicense, setDLicense] = useState('');
  const [dLoginId, setDLoginId] = useState('');
  const [dPassword, setDPassword] = useState('');

  // Change Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  async function loadAggregatorData() {
    let currentAggId = '';
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('provene_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.id && parsed.id !== 'ALL') currentAggId = parsed.id;
        } catch {
          // ignore
        }
      }
    }

    let aggRow: Aggregator | null = null;
    if (currentAggId) {
      const { data } = await supabase
        .from('aggregators')
        .select('*')
        .eq('id', currentAggId)
        .maybeSingle();
      aggRow = data || null;
    } else {
      const { data } = await supabase.from('aggregators').select('*').limit(1).maybeSingle();
      aggRow = data || null;
    }

    if (aggRow) {
      setAggregator(aggRow);

      const [driversRes, collectionsRes] = await Promise.all([
        supabase.from('drivers').select('*').eq('aggregator_id', aggRow.id),
        supabase
          .from('collections')
          .select('*')
          .eq('aggregator_id', aggRow.id)
          .order('created_at', { ascending: false }),
      ]);

      setAssignedDrivers(driversRes.data || []);
      setIntakeBatches(collectionsRes.data || []);
    }
  }

  useEffect(() => {
    loadAggregatorData();
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleCreateFleetDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aggregator) return;

    // Forces employment_type to THIRD_PARTY and locks to this aggregator's ID
    const { error } = await supabase.from('drivers').insert([
      {
        name: dName.trim(),
        phone: dPhone.trim(),
        vehicle_number: dVehicle.trim().toUpperCase(),
        license_number: dLicense.trim().toUpperCase(),
        employment_type: 'THIRD_PARTY',
        aggregator_id: aggregator.id,
        aggregator_name: aggregator.company_name,
        login_id: dLoginId.trim().toLowerCase(),
        password: dPassword.trim(),
      },
    ]);

    if (!error) {
      notify(`Driver ${dName} registered under ${aggregator.company_name} fleet.`);
      setDName('');
      setDPhone('');
      setDVehicle('');
      setDLicense('');
      setDLoginId('');
      setDPassword('');
      setDriverModalOpen(false);
      await loadAggregatorData();
    } else {
      alert(error.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (newPass.length < 5) {
      setPassError('Password must be at least 5 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Passwords do not match.');
      return;
    }
    if (!aggregator) return;

    const { error } = await supabase
      .from('aggregators')
      .update({ password: newPass.trim() })
      .eq('id', aggregator.id);

    if (!error) {
      notify('Password updated successfully.');
      setPasswordModalOpen(false);
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError(error.message);
    }
  };

  const handleExportCsv = () => {
    if (!aggregator) return;
    const rows = [
      ['PROVENE REFINERY INTAKE MANIFEST'],
      ['Offtake Partner', aggregator.company_name],
      ['GST / License', aggregator.gst_or_license],
      ['Contracted Rate', `Rs. ${aggregator.rate_per_kg} / kg`],
      [],
      ['Timestamp', 'Drum ID', 'Kitchen Origin', 'Driver', 'Weight (kg)', 'Settlement Value (INR)'],
      ...intakeBatches.map((b) => [
        new Date(b.created_at).toLocaleString('en-IN'),
        b.drum_id,
        b.kitchen_name,
        b.driver_name || 'Fleet Driver',
        `${b.weight_kg} kg`,
        `Rs. ${Math.round(b.weight_kg * aggregator.rate_per_kg)}`,
      ]),
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Provene_Intake_${aggregator.company_name.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalBoughtKg = Number(aggregator?.oil_bought_kg || 0);
  const maxCap = Number(aggregator?.max_capacity_kg || 5000);
  const rate = Number(aggregator?.rate_per_kg || 48);
  const utilization = Math.min(100, Math.round((totalBoughtKg / maxCap) * 100));
  const totalSpend = Math.round(totalBoughtKg * rate);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-16'
        } shrink-0 border-r border-slate-800/80 bg-[#0b101b] flex flex-col justify-between transition-all duration-200 z-30`}
      >
        <div>
          <div className="flex h-14 items-center gap-2.5 border-b border-slate-800/80 px-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
              <Building2 className="h-4 w-4" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <span className="text-xs font-extrabold text-white block truncate">
                  {aggregator?.company_name || 'BUYER PORTAL'}
                </span>
                <span className="text-[10px] font-mono text-amber-400 block truncate">
                  Refinery Partner
                </span>
              </div>
            )}
          </div>

          <nav className="p-2.5 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Droplets className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Intake Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                activeTab === 'fleet'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>Assigned Fleet</span>}
              </div>
              {sidebarOpen && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                  {assignedDrivers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                activeTab === 'ledger'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Intake Ledgers</span>}
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800/80 p-3 space-y-2">
          <button
            onClick={() => {
              setPassError('');
              setPasswordModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <KeyRound className="h-4 w-4 shrink-0 text-amber-400" />
            {sidebarOpen && <span>Change Password</span>}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('provene_session');
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
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
              {aggregator?.company_name} • GST: {aggregator?.gst_or_license}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDriverModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="h-3.5 w-3.5" /> Onboard Fleet Driver
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {toast && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {toast}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
                <span>Total Oil Sourced</span>
                <Droplets className="h-4 w-4 text-amber-400" />
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-white">
                {totalBoughtKg.toFixed(1)} <span className="text-sm font-normal text-slate-400">kg</span>
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Cap: {maxCap} kg/mo</span>
                <span className="text-amber-400">{utilization}% Capacity</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
                <span>Contract Offtake Rate</span>
                <IndianRupee className="h-4 w-4 text-emerald-400" />
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-emerald-400">
                ₹{rate} <span className="text-sm font-normal text-slate-400">/ kg</span>
              </p>
              <p className="mt-2 text-[11px] text-slate-400">Guaranteed Offtake Rate</p>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
                <span>Total Feedstock Spend</span>
                <Layers className="h-4 w-4 text-sky-400" />
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-sky-400">
                ₹{totalSpend.toLocaleString('en-IN')}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">{intakeBatches.length} Verified Batches</p>
            </div>

            <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center justify-between">
                <span>Dedicated Fleet</span>
                <Truck className="h-4 w-4 text-purple-400" />
              </span>
              <p className="mt-2 font-mono text-2xl font-bold text-white">{assignedDrivers.length}</p>
              <p className="mt-2 text-[11px] text-purple-400">Assigned 3PL Vehicles</p>
            </div>
          </div>

          {/* TAB 1: INTAKE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Monthly Allocation Progress</h3>
                  <span className="font-mono text-xs text-amber-400">{utilization}% Fulfilled</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current: {totalBoughtKg.toFixed(1)} kg</span>
                  <span>Minimum Lot: {aggregator?.min_capacity_kg} kg</span>
                  <span>Target Allocation: {maxCap} kg</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Recent Verified Oil Influx
                  </span>
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Manifest (.CSV)
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Drum ID</th>
                        <th className="py-2.5 px-4">Kitchen Origin</th>
                        <th className="py-2.5 px-4">Fleet Driver</th>
                        <th className="py-2.5 px-4 text-right">Net Weight</th>
                        <th className="py-2.5 px-4 text-right">Settlement Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {intakeBatches.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-500">
                            No intake batches logged yet for this facility.
                          </td>
                        </tr>
                      ) : (
                        intakeBatches.slice(0, 10).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-4 font-mono text-slate-400">
                              {new Date(b.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-sky-400">{b.drum_id}</td>
                            <td className="py-2.5 px-4 font-bold text-white">{b.kitchen_name}</td>
                            <td className="py-2.5 px-4 text-slate-300">
                              {b.driver_name || 'Fleet Driver'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                              {b.weight_kg} kg
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-white">
                              ₹{Math.round(b.weight_kg * rate)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLEET MANAGEMENT */}
          {activeTab === 'fleet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Assigned 3PL Fleet ({assignedDrivers.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Drivers enrolled directly under {aggregator?.company_name} for dedicated collection routes.
                  </p>
                </div>
                <button
                  onClick={() => setDriverModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" /> + Onboard Fleet Driver
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Vehicle Number</th>
                      <th className="py-3 px-4">License Number</th>
                      <th className="py-3 px-4">App Login ID</th>
                      <th className="py-3 px-4">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assignedDrivers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No drivers added to your fleet yet.
                        </td>
                      </tr>
                    ) : (
                      assignedDrivers.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-white">{d.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{d.phone}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-sky-400">
                            {d.vehicle_number}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">{d.license_number}</td>
                          <td className="py-3 px-4 font-mono text-emerald-400">{d.login_id}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{d.password}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Full Offtake Ledger</h2>
                  <p className="text-xs text-slate-400">
                    Complete digital chain-of-custody logs for refinery verification.
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Download className="h-3.5 w-3.5" /> Export All (.CSV)
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101b] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Drum ID</th>
                      <th className="py-3 px-4">Origin Kitchen</th>
                      <th className="py-3 px-4">Driver</th>
                      <th className="py-3 px-4 text-right">Net Wt</th>
                      <th className="py-3 px-4 text-right">Settlement (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {intakeBatches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {new Date(b.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono text-sky-400 font-semibold">{b.drum_id}</td>
                        <td className="py-3 px-4 font-bold text-white">{b.kitchen_name}</td>
                        <td className="py-3 px-4 text-slate-300">{b.driver_name}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {b.weight_kg} kg
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white">
                          ₹{Math.round(b.weight_kg * rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ONBOARD FLEET DRIVER MODAL */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Driver to {aggregator?.company_name}</h3>
              <button onClick={() => setDriverModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFleetDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Driver Full Name *</label>
                <input
                  required
                  value={dName}
                  onChange={(e) => setDName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Phone *</label>
                  <input
                    required
                    value={dPhone}
                    onChange={(e) => setDPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Vehicle Number *</label>
                  <input
                    required
                    value={dVehicle}
                    onChange={(e) => setDVehicle(e.target.value)}
                    placeholder="DL 1L AA 1234"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Driving License Number *</label>
                <input
                  required
                  value={dLicense}
                  onChange={(e) => setDLicense(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 space-y-2">
                <span className="font-bold text-amber-300 block">Driver Mobile App Credentials</span>
                <div>
                  <label className="block text-slate-300 mb-1">Login ID *</label>
                  <input
                    required
                    value={dLoginId}
                    onChange={(e) => setDLoginId(e.target.value)}
                    placeholder="e.g. driver@buyer.in"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Password *</label>
                  <input
                    required
                    value={dPassword}
                    onChange={(e) => setDPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 py-2.5 font-bold text-slate-950 hover:bg-amber-400"
              >
                Register & Link Driver
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Change Portal Password</h3>
              <button onClick={() => setPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            {passError && <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-2 text-xs text-red-300">{passError}</div>}
            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 py-2.5 font-bold text-slate-950 hover:bg-amber-400"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
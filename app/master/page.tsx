'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  supabase,
  Kitchen,
  Collection,
  Aggregator,
  Driver,
  Employee,
} from '@/lib/supabase';
import {
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  Store,
  Truck,
  Building2,
  Users,
  LogOut,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  KeyRound,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  Droplets,
  IndianRupee,
  BellRing,
  Eye,
} from 'lucide-react';

type ModuleTab = 'overview' | 'kitchens' | 'drivers' | 'aggregators' | 'employees';
type DrawerType = 'NONE' | 'ADD_KITCHEN' | 'ADD_DRIVER' | 'ADD_AGGREGATOR' | 'ADD_EMPLOYEE';

const CLUSTER_PRESETS = [
  { label: 'Sector 126', lat: 28.5442, lng: 77.334, address: 'Main Market, Sector 126, Noida' },
  { label: 'Sector 104', lat: 28.5389, lng: 77.3688, address: 'Commercial Market, Sector 104, Noida' },
  { label: 'Sector 76', lat: 28.5672, lng: 77.3792, address: 'Central Food Market, Sector 76, Noida' },
];

export default function ProveneEnterpriseOpsHub() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModuleTab>('overview');
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>('NONE');
  const [inspectedCollection, setInspectedCollection] = useState<Collection | null>(null);

  const [operatorName, setOperatorName] = useState('Parth Gupta');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  // Database State
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [aggregators, setAggregators] = useState<Aggregator[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Form States (Used inside Slide-Over Drawers)
  const [kName, setKName] = useState('');
  const [kOwner, setKOwner] = useState('');
  const [kPhone, setKPhone] = useState('');
  const [kFssai, setKFssai] = useState('');
  const [kFryer, setKFryer] = useState<number>(45);
  const [kAddress, setKAddress] = useState('Main Market, Sector 126, Noida');
  const [kLat, setKLat] = useState<number>(28.5442);
  const [kLng, setKLng] = useState<number>(77.334);
  const [kLoginId, setKLoginId] = useState('');
  const [kPassword, setKPassword] = useState('');

  const [dName, setDName] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dVehicle, setDVehicle] = useState('');
  const [dLicense, setDLicense] = useState('');
  const [dType, setDType] = useState<'PROVENE_HIRED' | 'THIRD_PARTY'>('PROVENE_HIRED');
  const [dAggregatorId, setDAggregatorId] = useState('');
  const [dLoginId, setDLoginId] = useState('');
  const [dPassword, setDPassword] = useState('');

  const [aCompany, setACompany] = useState('');
  const [aContact, setAContact] = useState('');
  const [aPhone, setAPhone] = useState('');
  const [aGst, setAGst] = useState('');
  const [aMinCap, setAMinCap] = useState<number>(200);
  const [aMaxCap, setAMaxCap] = useState<number>(5000);
  const [aRate, setARate] = useState<number>(48);

  const [eName, setEName] = useState('');
  const [eRole, setERole] = useState('Operations Manager');
  const [ePhone, setEPhone] = useState('');
  const [eLoginId, setELoginId] = useState('');
  const [ePassword, setEPassword] = useState('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  async function fetchAllData() {
    const [kRes, cRes, aRes, dRes, eRes] = await Promise.all([
      supabase.from('kitchens').select('*').order('created_at', { ascending: false }),
      supabase.from('collections').select('*').order('created_at', { ascending: false }),
      supabase.from('aggregators').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('*').order('created_at', { ascending: false }),
      supabase.from('employees').select('*').order('created_at', { ascending: false }),
    ]);

    setKitchens(kRes.data || []);
    setCollections(cRes.data || []);
    setAggregators(aRes.data || []);
    setDrivers(dRes.data || []);
    setEmployees(eRes.data || []);
    if (aRes.data && aRes.data.length > 0 && !dAggregatorId) {
      setDAggregatorId(aRes.data[0].id);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('provene_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setOperatorName(parsed.name);
        } catch {
          // ignore
        }
      }
    }
    fetchAllData();
  }, []);

  // Initialize Leaflet Map on Overview Tab
  useEffect(() => {
    if (activeTab !== 'overview' || typeof window === 'undefined' || !mapContainerRef.current)
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

      const map = L.map(mapContainerRef.current).setView([28.5505, 77.361], 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];
      const visibleKitchens =
        sectorFilter === 'ALL'
          ? kitchens
          : kitchens.filter((k) => k.address.toLowerCase().includes(sectorFilter.toLowerCase()));

      visibleKitchens.forEach((k) => {
        bounds.push([k.lat, k.lng]);
        const isUrgent = Boolean(k.pickup_requested);
        const marker = L.circleMarker([k.lat, k.lng], {
          radius: isUrgent ? 10 : 8,
          fillColor: isUrgent ? '#f59e0b' : '#10b981',
          color: '#090d16',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        }).addTo(map);

        marker.bindPopup(
          `<div style="color:#0f172a;font-family:sans-serif;font-size:12px;line-height:1.4;">
            <strong>${k.name}</strong><br/>
            <span style="color:#475569;">${k.address}</span><br/>
            <span>Fryer: <b>${k.fryer_capacity_liters}L</b> • FSSAI: ${k.fssai_number}</span>
          </div>`
        );
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) {
      setTimeout(initMap, 60);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    }
  }, [activeTab, kitchens, sectorFilter]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Drawer Submit Handlers
  const handleCreateKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    const weeklyEst = Number((kFryer * 0.85).toFixed(1));
    const { error } = await supabase.from('kitchens').insert([
      {
        name: kName,
        owner_name: kOwner,
        phone: kPhone,
        fssai_number: kFssai,
        fryer_capacity_liters: Number(kFryer),
        weekly_est_uco_kg: weeklyEst,
        lat: Number(kLat),
        lng: Number(kLng),
        address: kAddress,
        login_id: kLoginId.trim().toLowerCase(),
        password: kPassword.trim(),
        iscc_declared: true,
      },
    ]);

    if (!error) {
      notify(`Onboarded ${kName} (${kLoginId})`);
      setKName('');
      setKOwner('');
      setKPhone('');
      setKFssai('');
      setKLoginId('');
      setKPassword('');
      setActiveDrawer('NONE');
      await fetchAllData();
    } else {
      alert(error.message);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenAgg = aggregators.find((a) => a.id === dAggregatorId);
    const aggName =
      dType === 'PROVENE_HIRED'
        ? 'Provene Direct Fleet'
        : chosenAgg?.company_name || 'Third-Party Aggregator';

    const { error } = await supabase.from('drivers').insert([
      {
        name: dName,
        phone: dPhone,
        vehicle_number: dVehicle,
        license_number: dLicense,
        employment_type: dType,
        aggregator_id: dType === 'THIRD_PARTY' && dAggregatorId ? dAggregatorId : null,
        aggregator_name: aggName,
        login_id: dLoginId.trim().toLowerCase(),
        password: dPassword.trim(),
      },
    ]);

    if (!error) {
      notify(`Registered Driver ${dName} (${dLoginId})`);
      setDName('');
      setDPhone('');
      setDVehicle('');
      setDLicense('');
      setDLoginId('');
      setDPassword('');
      setActiveDrawer('NONE');
      await fetchAllData();
    } else {
      alert(error.message);
    }
  };

  const handleCreateAggregator = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('aggregators').insert([
      {
        company_name: aCompany,
        contact_person: aContact,
        phone: aPhone,
        gst_or_license: aGst,
        min_capacity_kg: Number(aMinCap),
        max_capacity_kg: Number(aMaxCap),
        rate_per_kg: Number(aRate),
        oil_bought_kg: 0,
      },
    ]);

    if (!error) {
      notify(`Registered Buyer ${aCompany}`);
      setACompany('');
      setAContact('');
      setAPhone('');
      setAGst('');
      setActiveDrawer('NONE');
      await fetchAllData();
    } else {
      alert(error.message);
    }
  };

  const handleDispatchBatchToBuyer = async (agg: Aggregator) => {
    const input = window.prompt(
      `Dispatch Oil Batch to ${agg.company_name} (Min Lot: ${agg.min_capacity_kg} kg):`,
      String(agg.min_capacity_kg)
    );
    if (!input) return;
    const kg = Number(input);
    if (isNaN(kg) || kg <= 0) return;

    await supabase
      .from('aggregators')
      .update({ oil_bought_kg: Number(agg.oil_bought_kg || 0) + kg })
      .eq('id', agg.id);
    notify(`Dispatched ${kg} kg to ${agg.company_name}`);
    await fetchAllData();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('employees').insert([
      {
        name: eName,
        role: eRole,
        phone: ePhone,
        login_id: eLoginId.trim().toLowerCase(),
        password: ePassword.trim(),
      },
    ]);

    if (!error) {
      notify(`Added Team Member ${eName} (${eLoginId})`);
      setEName('');
      setEPhone('');
      setELoginId('');
      setEPassword('');
      setActiveDrawer('NONE');
      await fetchAllData();
    } else {
      alert(error.message);
    }
  };

  // Operational & Financial Metrics
  const totalCollectedKg = collections.reduce((s, c) => s + Number(c.weight_kg || 0), 0);
  const totalProcurementCost = collections.reduce((s, c) => s + Number(c.payout_inr || 0), 0);
  const totalDispatchedKg = aggregators.reduce((s, a) => s + Number(a.oil_bought_kg || 0), 0);
  const hubTankInventoryKg = Math.max(0, totalCollectedKg - totalDispatchedKg);
  const estRevenueInr = Math.round(totalCollectedKg * 48);
  const netMarginInr = estRevenueInr - totalProcurementCost;
  const urgentRequests = kitchens.filter((k) => k.pickup_requested);

  const navItems: { id: ModuleTab; label: string; count?: number; icon: typeof LayoutDashboard }[] =
    [
      { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
      { id: 'kitchens', label: 'Kitchen Network', count: kitchens.length, icon: Store },
      { id: 'drivers', label: 'Fleet & Drivers', count: drivers.length, icon: Truck },
      { id: 'aggregators', label: 'Refinery Buyers', count: aggregators.length, icon: Building2 },
      { id: 'employees', label: 'Team & IAM', count: employees.length + 1, icon: Users },
    ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
      {/* LEFT ENTERPRISE SIDEBAR (Collapsible via 3-Line Menu) */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'
          } shrink-0 border-r border-slate-800/80 bg-[#0b101b] flex flex-col justify-between transition-all duration-200 z-30`}
      >
        <div>
          {/* Brand Logo Bar */}
          <div className="flex h-14 items-center justify-between border-b border-slate-800/80 px-4">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black">
                <ShieldCheck className="h-5 w-5" />
              </div>
              {sidebarOpen && (
                <div className="leading-none">
                  <span className="text-sm font-extrabold tracking-tight text-white block">
                    PROVENE
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">OPS HUB v2.4</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition ${active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && item.count !== undefined && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Operator Footer & Logout */}
        <div className="border-t border-slate-800/80 p-3 space-y-2">
          {sidebarOpen && (
            <div className="rounded-lg bg-slate-900/90 px-3 py-2 border border-slate-800/80">
              <p className="text-xs font-semibold text-white truncate">{operatorName}</p>
              <p className="text-[10px] text-emerald-400 font-mono">Noida Cluster Admin</p>
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('provene_session');
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP ENTERPRISE COMMAND BAR */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b101b] px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:border-slate-700 hover:text-white"
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="relative hidden sm:block w-72">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kitchens, drums, drivers, FSSAI..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {urgentRequests.length > 0 && (
              <button
                onClick={() => setActiveTab('kitchens')}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300"
              >
                <BellRing className="h-3.5 w-3.5 animate-bounce" />
                {urgentRequests.length} Pickup Request{urgentRequests.length > 1 ? 's' : ''}
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Noida Hub (Sec 126 • 104 • 76)</span>
            </div>

            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </button>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {toast && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {toast}
            </div>
          )}

          {/* MODULE 1: COMMAND OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Supply Chain Telemetry & Dispatch Radar
                  </h1>
                  <p className="text-xs text-slate-400">
                    Real-time inventory, unit economics, and collection verification across Noida
                    clusters.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDrawer('ADD_KITCHEN')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> Onboard Kitchen
                  </button>
                  <button
                    onClick={() => setActiveDrawer('ADD_DRIVER')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Driver
                  </button>
                </div>
              </div>

              {/* High-Density Unit Economics & Telemetry Strip */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Hub Tank Inventory</span>
                    <Droplets className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
                    {hubTankInventoryKg.toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">kg</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Gross Collected: {totalCollectedKg.toFixed(1)} kg</span>
                    <span className="text-emerald-400">{collections.length} Drums</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Kitchen Payouts (@ ₹36/kg)</span>
                    <IndianRupee className="h-4 w-4 text-sky-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
                    ₹{totalProcurementCost.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Active Outlets: {kitchens.length}</span>
                    <span className="text-sky-400">UPI Settled</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Projected Gross Margin</span>
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                    +₹{netMarginInr.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Est. Offtake Value: ₹{estRevenueInr.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400">~25% Spread</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <span>Active Dispatch Queue</span>
                    <Truck className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
                    {urgentRequests.length}{' '}
                    <span className="text-sm font-normal text-amber-400">Priority Stops</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Fleet Size: {drivers.length} Drivers</span>
                    <span className="text-amber-400">{aggregators.length} Buyers</span>
                  </div>
                </div>
              </div>

              {/* Split View: Geospatial Cluster Radar (5 cols) + Collection Manifest Table (7 cols) */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Geospatial Radar */}
                <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0d1322] flex flex-col justify-between overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Cluster Geospatial Radar
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {['ALL', 'Sector 126', 'Sector 104', 'Sector 76'].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setSectorFilter(sec)}
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${sectorFilter === sec
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                          {sec === 'ALL' ? 'All' : sec.replace('Sector ', 'S')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    ref={mapContainerRef}
                    className="h-[370px] w-full bg-slate-950 z-0 [&_.leaflet-tile-pane]:invert [&_.leaflet-tile-pane]:hue-rotate-180 [&_.leaflet-tile-pane]:brightness-95 [&_.leaflet-tile-pane]:contrast-90"
                  />

                  <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Standard Partner
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400" /> Pickup Requested (Full)
                    </span>
                  </div>
                </div>

                {/* High-Density Collection Manifest Table */}
                <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Live Collection Manifest
                      </span>
                      <span className="ml-2 rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        {collections.length} batches
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Click &quot;Inspect Key&quot; to view private batch hash
                    </span>
                  </div>

                  <div className="overflow-x-auto flex-1 max-h-[395px]">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Drum ID</th>
                          <th className="py-2.5 px-3">Kitchen Outlet</th>
                          <th className="py-2.5 px-3">Driver / Fleet</th>
                          <th className="py-2.5 px-3 text-right">Net Wt</th>
                          <th className="py-2.5 px-3 text-right">Payout</th>
                          <th className="py-2.5 px-3 text-right">Security</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {collections.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-500">
                              No oil collections logged yet.
                            </td>
                          </tr>
                        ) : (
                          collections.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-2.5 px-3 font-mono font-semibold text-sky-400">
                                {c.drum_id}
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="font-semibold text-slate-200">{c.kitchen_name}</p>
                                <p className="text-[10px] text-slate-500">
                                  {new Date(c.created_at).toLocaleString('en-IN')}
                                </p>
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="text-slate-300">{c.driver_name || 'Fleet Driver'}</p>
                                <p className="text-[10px] text-slate-500">
                                  {c.aggregator_name || 'Provene Direct'}
                                </p>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                                {c.weight_kg} kg
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-200 tabular-nums">
                                ₹{c.payout_inr}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => setInspectedCollection(c)}
                                  className="inline-flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-300 hover:bg-purple-500/20"
                                >
                                  <Eye className="h-3 w-3" /> Inspect Key
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: KITCHEN NETWORK TABLE */}
          {activeTab === 'kitchens' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Partner Kitchen Network ({kitchens.length})
                  </h1>
                  <p className="text-xs text-slate-400">
                    Manage commercial restaurant accounts, FSSAI licenses, pickup requests, and
                    portal login credentials.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer('ADD_KITCHEN')}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" /> Onboard New Kitchen
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Restaurant & Address</th>
                        <th className="py-3 px-4">Owner & Contact</th>
                        <th className="py-3 px-4">FSSAI License</th>
                        <th className="py-3 px-4">Fryer Cap</th>
                        <th className="py-3 px-4">Pickup Status</th>
                        <th className="py-3 px-4">Total Collected</th>
                        <th className="py-3 px-4">Portal Login ID / Pass</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {kitchens
                        .filter(
                          (k) =>
                            k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            k.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            k.fssai_number.includes(searchQuery)
                        )
                        .map((k) => {
                          const kPickups = collections.filter((c) => c.kitchen_id === k.id);
                          const kTotalKg = kPickups.reduce(
                            (s, c) => s + Number(c.weight_kg || 0),
                            0
                          );
                          return (
                            <tr key={k.id} className="hover:bg-slate-800/30">
                              <td className="py-3 px-4">
                                <p className="font-bold text-white">{k.name}</p>
                                <p className="text-[11px] text-slate-400">{k.address}</p>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-slate-200">{k.owner_name}</p>
                                <p className="font-mono text-[11px] text-slate-400">{k.phone}</p>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">
                                {k.fssai_number}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">
                                {k.fryer_capacity_liters} L
                              </td>
                              <td className="py-3 px-4">
                                {k.pickup_requested ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                                    ● DRUM FULL (REQUESTED)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    ● ACTIVE
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                {kTotalKg.toFixed(1)} kg ({kPickups.length})
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-sky-400">
                                {k.login_id || 'kitchen@provene.in'}
                                <span className="text-slate-500 block">
                                  Pass: {k.password || 'kitchen123'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Delete ${k.name}?`)) return;
                                    await supabase
                                      .from('collections')
                                      .delete()
                                      .eq('kitchen_id', k.id);
                                    await supabase.from('kitchens').delete().eq('id', k.id);
                                    fetchAllData();
                                  }}
                                  className="rounded border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: FLEET & DRIVERS TABLE */}
          {activeTab === 'drivers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Fleet & Field Collectors ({drivers.length})
                  </h1>
                  <p className="text-xs text-slate-400">
                    Manage Provene in-house drivers and third-party aggregator collection agents.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer('ADD_DRIVER')}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400"
                >
                  <Plus className="h-4 w-4" /> Onboard New Driver
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Driver Name & Phone</th>
                        <th className="py-3 px-4">Vehicle & License</th>
                        <th className="py-3 px-4">Fleet Classification</th>
                        <th className="py-3 px-4">Assigned Buyer / Hub</th>
                        <th className="py-3 px-4">Volume Collected</th>
                        <th className="py-3 px-4">App Login ID / Pass</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {drivers.map((d) => {
                        const dRuns = collections.filter((c) => c.driver_name === d.name);
                        const dKg = dRuns.reduce((s, c) => s + Number(c.weight_kg || 0), 0);
                        return (
                          <tr key={d.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <p className="font-bold text-white">{d.name}</p>
                              <p className="font-mono text-[11px] text-slate-400">{d.phone}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono font-semibold text-slate-200">
                                {d.vehicle_number}
                              </p>
                              <p className="font-mono text-[10px] text-slate-500">
                                DL: {d.license_number}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              {d.employment_type === 'PROVENE_HIRED' ? (
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  IN-HOUSE FLEET
                                </span>
                              ) : (
                                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                  3PL AGGREGATOR
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{d.aggregator_name}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {dKg.toFixed(1)} kg ({dRuns.length} stops)
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-sky-400">
                              {d.login_id}
                              <span className="text-slate-500 block">Pass: {d.password}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  await supabase.from('drivers').delete().eq('id', d.id);
                                  fetchAllData();
                                }}
                                className="rounded border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 4: REFINERY BUYERS / AGGREGATORS */}
          {activeTab === 'aggregators' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Certified Offtake Buyers & Aggregators ({aggregators.length})
                  </h1>
                  <p className="text-xs text-slate-400">
                    Track minimum lot sizes, monthly offtake capacities, contracted rates, and
                    assigned 3PL drivers.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer('ADD_AGGREGATOR')}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" /> Register New Buyer
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Buyer Company & GST</th>
                        <th className="py-3 px-4">Procurement Contact</th>
                        <th className="py-3 px-4">Min / Max Capacity</th>
                        <th className="py-3 px-4">Contract Rate</th>
                        <th className="py-3 px-4">Total Oil Purchased</th>
                        <th className="py-3 px-4">3PL Drivers Under Buyer</th>
                        <th className="py-3 px-4 text-right">Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {aggregators.map((a) => {
                        const assignedDrivers = drivers.filter((d) => d.aggregator_id === a.id);
                        const driverKg = collections
                          .filter((c) => c.aggregator_id === a.id)
                          .reduce((s, c) => s + Number(c.weight_kg || 0), 0);
                        const totalBought = Number(a.oil_bought_kg || 0) + driverKg;
                        const utilization = Math.min(
                          100,
                          Math.round((totalBought / (a.max_capacity_kg || 5000)) * 100)
                        );

                        return (
                          <tr key={a.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-4">
                              <p className="font-bold text-white">{a.company_name}</p>
                              <p className="font-mono text-[10px] text-slate-400">
                                GST: {a.gst_or_license}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-200">{a.contact_person}</p>
                              <p className="font-mono text-[11px] text-slate-400">{a.phone}</p>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              Min: {a.min_capacity_kg} kg
                              <span className="block text-[10px] text-slate-500">
                                Max: {a.max_capacity_kg} kg/mo
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              ₹{a.rate_per_kg}/kg
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-mono font-bold text-amber-400">
                                {totalBought.toFixed(1)} kg (₹
                                {Math.round(totalBought * a.rate_per_kg).toLocaleString('en-IN')})
                              </p>
                              <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-amber-400"
                                  style={{ width: `${utilization}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-sky-400">
                                {assignedDrivers.length} Drivers
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDispatchBatchToBuyer(a)}
                                className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                              >
                                + Dispatch Load
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: TEAM & IAM (EMPLOYEES) */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Internal Team & Access Management ({employees.length + 1})
                  </h1>
                  <p className="text-xs text-slate-400">
                    Manage internal Provene employees with Ops Hub console access.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer('ADD_EMPLOYEE')}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-purple-400"
                >
                  <Plus className="h-4 w-4" /> Invite Team Member
                </button>
              </div>

              <div className="rounded-xl border border-slate-800/90 bg-[#0d1322] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101b] text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Employee Name</th>
                      <th className="py-3 px-4">Role / Department</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Ops Hub Login ID</th>
                      <th className="py-3 px-4">Password</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="bg-purple-950/15">
                      <td className="py-3 px-4 font-bold text-white">Parth Gupta</td>
                      <td className="py-3 px-4 text-purple-300 font-semibold">
                        Founder / Super Admin
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">Primary Owner</td>
                      <td className="py-3 px-4 font-mono text-purple-300">founder@provene.in</td>
                      <td className="py-3 px-4 font-mono text-slate-500">••••••••</td>
                      <td className="py-3 px-4 text-right text-[10px] font-mono text-purple-400">
                        ROOT
                      </td>
                    </tr>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-white">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-300">{emp.role}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{emp.phone}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{emp.login_id}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{emp.password}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              await supabase.from('employees').delete().eq('id', emp.id);
                              fetchAllData();
                            }}
                            className="rounded border border-red-500/30 bg-red-500/10 p-1.5 text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* PRIVATE HASH INSPECTOR MODAL (FOR FOUNDER) */}
      {inspectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-bold text-white">
                  Batch Security Audit — {inspectedCollection.drum_id}
                </span>
              </div>
              <button
                onClick={() => setInspectedCollection(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 block text-[10px]">ORIGIN KITCHEN</span>
                <span className="font-bold text-white">{inspectedCollection.kitchen_name}</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500 block text-[10px]">VERIFIED WEIGHT & PAYOUT</span>
                <span className="font-bold text-emerald-400">
                  {inspectedCollection.weight_kg} kg (₹{inspectedCollection.payout_inr})
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-purple-400">
                Private Founder Hash Key (Hidden from Drivers & Kitchens):
              </span>
              <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 font-mono text-xs text-purple-300 break-all">
                {inspectedCollection.sha256_hash}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Raw Telemetry Payload:
              </span>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                {inspectedCollection.payload_json}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-SIDE SLIDE-OVER DRAWER FOR ALL CREATION WORKFLOWS */}
      {activeDrawer !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={() => setActiveDrawer('NONE')}
          />
          <div className="relative z-10 w-full max-w-md border-l border-slate-800 bg-[#0b101b] p-6 overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white">
                {activeDrawer === 'ADD_KITCHEN' && 'Onboard Partner Kitchen'}
                {activeDrawer === 'ADD_DRIVER' && 'Onboard Fleet Driver'}
                {activeDrawer === 'ADD_AGGREGATOR' && 'Register Offtake Buyer'}
                {activeDrawer === 'ADD_EMPLOYEE' && 'Invite Internal Employee'}
              </h2>
              <button
                onClick={() => setActiveDrawer('NONE')}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DRAWER 1: ADD KITCHEN */}
            {activeDrawer === 'ADD_KITCHEN' && (
              <form onSubmit={handleCreateKitchen} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Restaurant Name *</label>
                  <input
                    required
                    value={kName}
                    onChange={(e) => setKName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Owner Name *</label>
                    <input
                      required
                      value={kOwner}
                      onChange={(e) => setKOwner(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Phone *</label>
                    <input
                      required
                      value={kPhone}
                      onChange={(e) => setKPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">14-Digit FSSAI *</label>
                    <input
                      required
                      value={kFssai}
                      onChange={(e) => setKFssai(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Fryer Capacity (L) *</label>
                    <input
                      type="number"
                      required
                      value={kFryer}
                      onChange={(e) => setKFryer(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Cluster Location Preset</label>
                  <div className="flex gap-2">
                    {CLUSTER_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setKLat(p.lat);
                          setKLng(p.lng);
                          setKAddress(p.address);
                        }}
                        className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-emerald-500"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Street Address *</label>
                  <input
                    required
                    value={kAddress}
                    onChange={(e) => setKAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-3">
                  <span className="font-bold text-emerald-400 block">
                    Assign Restaurant Portal Credentials
                  </span>
                  <div>
                    <label className="block text-slate-300 mb-1">Login ID *</label>
                    <input
                      required
                      value={kLoginId}
                      onChange={(e) => setKLoginId(e.target.value)}
                      placeholder="outlet@provene.in"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Password *</label>
                    <input
                      required
                      value={kPassword}
                      onChange={(e) => setKPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-500 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Save & Activate Kitchen
                </button>
              </form>
            )}

            {/* DRAWER 2: ADD DRIVER */}
            {activeDrawer === 'ADD_DRIVER' && (
              <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
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
                      placeholder="UP16 AB 4921"
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
                <div className="space-y-2">
                  <label className="block text-slate-300">Fleet Classification *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDType('PROVENE_HIRED')}
                      className={`rounded-lg border py-2 font-bold ${dType === 'PROVENE_HIRED'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-800 text-slate-400'
                        }`}
                    >
                      Provene In-House
                    </button>
                    <button
                      type="button"
                      onClick={() => setDType('THIRD_PARTY')}
                      className={`rounded-lg border py-2 font-bold ${dType === 'THIRD_PARTY'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-slate-800 text-slate-400'
                        }`}
                    >
                      3PL Aggregator
                    </button>
                  </div>
                  {dType === 'THIRD_PARTY' && (
                    <select
                      value={dAggregatorId}
                      onChange={(e) => setDAggregatorId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white mt-2"
                    >
                      {aggregators.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.company_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-3 space-y-3">
                  <span className="font-bold text-sky-400 block">Driver App Credentials</span>
                  <div>
                    <label className="block text-slate-300 mb-1">Driver Login ID *</label>
                    <input
                      required
                      value={dLoginId}
                      onChange={(e) => setDLoginId(e.target.value)}
                      placeholder="drivername@provene.in"
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
                  className="w-full rounded-lg bg-sky-500 py-3 font-bold text-slate-950 hover:bg-sky-400"
                >
                  Save & Activate Driver
                </button>
              </form>
            )}

            {/* DRAWER 3: ADD AGGREGATOR */}
            {activeDrawer === 'ADD_AGGREGATOR' && (
              <form onSubmit={handleCreateAggregator} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Buyer / Refinery Name *</label>
                  <input
                    required
                    value={aCompany}
                    onChange={(e) => setACompany(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Contact Person *</label>
                    <input
                      required
                      value={aContact}
                      onChange={(e) => setAContact(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Phone *</label>
                    <input
                      required
                      value={aPhone}
                      onChange={(e) => setAPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">GST / Biofuel License No. *</label>
                  <input
                    required
                    value={aGst}
                    onChange={(e) => setAGst(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Min Lot (kg)</label>
                    <input
                      type="number"
                      required
                      value={aMinCap}
                      onChange={(e) => setAMinCap(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Max Cap (kg)</label>
                    <input
                      type="number"
                      required
                      value={aMaxCap}
                      onChange={(e) => setAMaxCap(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Rate (₹/kg)</label>
                    <input
                      type="number"
                      required
                      value={aRate}
                      onChange={(e) => setARate(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-500 py-3 font-bold text-slate-950 hover:bg-amber-400"
                >
                  Register Buyer Account
                </button>
              </form>
            )}

            {/* DRAWER 4: ADD EMPLOYEE */}
            {activeDrawer === 'ADD_EMPLOYEE' && (
              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Employee Name *</label>
                  <input
                    required
                    value={eName}
                    onChange={(e) => setEName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Designation / Role *</label>
                  <input
                    required
                    value={eRole}
                    onChange={(e) => setERole(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone *</label>
                  <input
                    required
                    value={ePhone}
                    onChange={(e) => setEPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Ops Hub Login ID *</label>
                  <input
                    required
                    value={eLoginId}
                    onChange={(e) => setELoginId(e.target.value)}
                    placeholder="name@provene.in"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Password *</label>
                  <input
                    required
                    value={ePassword}
                    onChange={(e) => setEPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-500 py-3 font-bold text-slate-950 hover:bg-purple-400"
                >
                  Grant Ops Hub Access
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
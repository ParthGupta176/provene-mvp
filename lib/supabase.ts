import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Kitchen {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  fssai_number: string;
  fryer_capacity_liters: number;
  weekly_est_uco_kg: number;
  lat: number;
  lng: number;
  address: string;
  group_name?: string;
  login_id?: string;
  password?: string;
  pickup_requested?: boolean;
  pickup_eta?: string;
  iscc_declared: boolean;
  created_at: string;
}

export interface Aggregator {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  gst_or_license: string;
  min_capacity_kg: number;
  max_capacity_kg: number;
  rate_per_kg: number;
  oil_bought_kg: number;
  login_id?: string;
  password?: string;
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  license_number: string;
  employment_type: 'PROVENE_HIRED' | 'THIRD_PARTY';
  aggregator_id?: string | null;
  aggregator_name?: string;
  login_id: string;
  password: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  login_id: string;
  password: string;
  created_at: string;
}

export interface Collection {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  drum_id: string;
  weight_kg: number;
  tpc_percent: number;
  moisture_percent: number;
  payout_inr: number;
  plausibility_status: string;
  payload_json: string;
  sha256_hash: string;
  collector_gps?: string;
  driver_name?: string;
  aggregator_id?: string | null;
  aggregator_name?: string;
  created_at: string;
}
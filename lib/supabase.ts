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
    signature_data?: string;
    iscc_declared: boolean;
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
    created_at: string;
}
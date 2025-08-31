import { SupabaseClient } from '@supabase/supabase-js';

// Supabase is disconnected.
const supabaseUrl = null;
const supabaseAnonKey = null;

export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient;

console.warn("Supabase is disconnected. The app will run in offline mode using localStorage.");
// A simple mock to prevent crashes when Supabase is not configured.
supabase = {} as SupabaseClient; 

export { supabase };
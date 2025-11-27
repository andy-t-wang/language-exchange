import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
// This bypasses RLS - use only in API routes with proper auth checks

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseAdmin;
}

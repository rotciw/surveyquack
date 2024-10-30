import { createClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/cloudflare';

let supabase: ReturnType<typeof createClient>;

export function getSupabaseClient(context: AppLoadContext) {
  if (supabase) return supabase;

  const supabaseUrl = context.env.SUPABASE_URL;
  const supabaseKey = context.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

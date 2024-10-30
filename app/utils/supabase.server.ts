import { createClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/cloudflare';

let supabase: ReturnType<typeof createClient>;

export function getSupabaseClient(context: AppLoadContext) {
  const env = context.env || context.cloudflare?.env;
  
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    console.error('Initializing Supabase client with context:', {
      hasEnv: !!context.env,
      hasSupabaseUrl: !!env?.SUPABASE_URL,
      hasSupabaseKey: !!env?.SUPABASE_ANON_KEY
    });
    throw new Error('Missing Supabase configuration');
  }

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );
}

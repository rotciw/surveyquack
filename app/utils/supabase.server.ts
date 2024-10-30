import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.server';

let _supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(context: any) {
  if (_supabaseClient) return _supabaseClient;

  const env = getEnv(context);
  
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase configuration');
    throw new Error('Missing Supabase configuration');
  }

  _supabaseClient = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );

  return _supabaseClient;
}

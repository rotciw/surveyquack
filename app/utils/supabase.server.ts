import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.server';

export function getSupabaseClient(context: any) {
  const env = getEnv(context);
  
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    console.error('Missing Supabase configuration');
    throw new Error('Missing Supabase configuration');
  }

  // Create a new client instance for each request
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

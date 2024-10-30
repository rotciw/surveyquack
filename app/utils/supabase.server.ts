import { createClient } from '@supabase/supabase-js';
import type { AppLoadContext } from '@remix-run/cloudflare';

let supabase: ReturnType<typeof createClient>;

export function getSupabaseClient(context: AppLoadContext) {
  try {
    if (supabase) return supabase;

    console.log('Initializing Supabase client with context:', {
      hasEnv: !!context.env,
      hasSupabaseUrl: !!context.env?.SUPABASE_URL,
      hasSupabaseKey: !!context.env?.SUPABASE_ANON_KEY
    });

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration:', { supabaseUrl, supabaseKey });
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
}

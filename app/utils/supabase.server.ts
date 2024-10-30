import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export function getEnv(context: any) {
  // For development
  if (process.env.NODE_ENV === 'development') {
    return {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  // For production
  return context.env;
} 
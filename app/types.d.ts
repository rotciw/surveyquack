declare global {
  const ENV: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SESSION_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  };
}

export {}; 
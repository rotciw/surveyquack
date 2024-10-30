import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      remix({
        serverEntry: "entry.cloudflare.tsx",
        // Add this to pass env variables to the server
        serverEnv: Object.keys(env).reduce((acc, key) => {
          acc[key] = env[key];
          return acc;
        }, {} as Record<string, string>),
      }),
      tsconfigPaths(),
    ],
    // Provide env to dev server
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY),
      "process.env.SESSION_SECRET": JSON.stringify(env.SESSION_SECRET),
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(env.GOOGLE_CLIENT_ID),
      "process.env.GOOGLE_CLIENT_SECRET": JSON.stringify(env.GOOGLE_CLIENT_SECRET),
    },
  };
});

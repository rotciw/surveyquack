import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { getSessionStorage } from "./session.server";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { getEnv } from "./env.server";

export function getAuthenticator(context: AppLoadContext) {
  const authenticator = new Authenticator(getSessionStorage(context));
  const env = getEnv(context);
  const googleStrategy = new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async ({ profile }) => {
      return {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar_url: profile.photos?.[0]?.value,
      };
    }
  );

  authenticator.use(googleStrategy);
  return authenticator;
}
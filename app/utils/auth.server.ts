import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { getSessionStorage } from "./session.server";
import type { AppLoadContext } from "@remix-run/cloudflare";

export function getAuthenticator(context: AppLoadContext) {
  const authenticator = new Authenticator(getSessionStorage(context));

  const googleStrategy = new GoogleStrategy(
    {
      clientID: (context.env as any).GOOGLE_CLIENT_ID,
      clientSecret: (context.env as any).GOOGLE_CLIENT_SECRET,
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
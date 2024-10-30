import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "./session.server";

export const authenticator = new Authenticator(sessionStorage);

const googleStrategy = new GoogleStrategy(
  {
    clientID: ENV.GOOGLE_CLIENT_ID as string,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "http://localhost:5173/auth/google/callback",
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    const id = profile.id || `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || '',
      avatar_url: profile.photos?.[0]?.value || '',
    };
  }
);

authenticator.use(googleStrategy);
import { createCookieSessionStorage, redirect } from "@remix-run/cloudflare";
import type { AppLoadContext, Session } from "@remix-run/cloudflare";
import { getEnv } from "./env.server";

export function getSessionStorage(context: AppLoadContext) {
  const env = getEnv(context);
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required');
  }

  return createCookieSessionStorage({
    cookie: {
      name: "_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [env.SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
  });
}

export async function getSession(context: AppLoadContext, cookieHeader: string | null) {
  const storage = getSessionStorage(context);
  return storage.getSession(cookieHeader);
}

export async function commitSession(context: AppLoadContext, session: any, options: any) {
  const storage = getSessionStorage(context);
  return storage.commitSession(session, options);
}

export async function destroySession(context: AppLoadContext, session: Session) {
  const storage = getSessionStorage(context);
  return storage.destroySession(session);
}

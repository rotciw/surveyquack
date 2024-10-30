import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type { AppLoadContext } from "@remix-run/cloudflare";

export function getSessionStorage(context: AppLoadContext) {
  if (!context?.env?.SESSION_SECRET) {
    console.error('Session configuration error:', { context, env: context?.env });
    throw new Error('SESSION_SECRET is required');
  }

  return createCookieSessionStorage({
    cookie: {
      name: "_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.env.SESSION_SECRET],
      secure: true,
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

export async function destroySession(context: AppLoadContext, session: any) {
  const storage = getSessionStorage(context);
  return storage.destroySession(session);
}
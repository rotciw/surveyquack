import { createCookieSessionStorage } from "@remix-run/cloudflare";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [ENV.SESSION_SECRET as string],
    secure: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
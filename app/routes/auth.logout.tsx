import type { ActionFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getSession, destroySession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, context }) => {
  const session = await getSession(context, request.headers.get("Cookie"));
  
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(context, session),
    },
  });
}; 
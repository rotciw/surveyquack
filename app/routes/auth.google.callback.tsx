import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSession, commitSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, context }) => {
  try {
    const authenticator = getAuthenticator(context);
    const user = await authenticator.authenticate("google", request, {
      failureRedirect: "/",
    });
    
    const session = await getSession(context, request.headers.get("Cookie"));
    session.set("user", user);
    
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(context, session, {
          maxAge: 60 * 60 * 24 * 30 // 30 days
        }),
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return redirect("/?error=authentication_failed");
  }
};
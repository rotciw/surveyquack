import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await authenticator.authenticate("google", request, {
      failureRedirect: "/",
    });
    const session = await getSession(request.headers.get("Cookie"));
    session.set("user", user);
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return redirect("/?error=authentication_failed");
  }
};
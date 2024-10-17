import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    return await authenticator.authenticate("google", request, {
      successRedirect: "/dashboard",
      failureRedirect: "/",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return redirect("/error=authentication_failed");
  }
};
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";

export const loader: LoaderFunction = () => redirect("/");

export const action: ActionFunction = ({ request, context }) => {
  const authenticator = getAuthenticator(context);
  return authenticator.authenticate("google", request);
};
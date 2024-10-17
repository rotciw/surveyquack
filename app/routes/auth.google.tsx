import { ActionFunction, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";

export const loader: LoaderFunction = () => redirect("/");

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("google", request);
};
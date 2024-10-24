import { data, json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { supabase } from "~/utils/supabase.server";
import { Dashboard } from "~/components/Dashboard";
import { authenticator } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('id, title')
    .eq('user_id', user.id);
    
  if (error) throw new Error(error.message);

  return json({ surveys: surveys || [] });
};

export default function DashboardPage() {
  const { surveys } = useLoaderData();
  return <Dashboard surveys={surveys} />;
}
import { data, json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { supabase } from "~/utils/supabase.server";
import { Dashboard } from "~/components/Dashboard";
import { authenticator } from "~/utils/auth.server";
import { Survey } from "~/models/survey";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  }) as { id: string };
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('id, title')
    .eq('user_id', user.id);
    
  if (error) throw new Error(error.message);

  return json({ surveys: surveys || [] });
};

type LoaderData = {
  surveys: Survey[];
};

export default function DashboardPage() {
  const { surveys } = useLoaderData<LoaderData>();
  return <Dashboard surveys={surveys} />;
}
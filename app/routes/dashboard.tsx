import type { LoaderFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Dashboard } from '~/components/Dashboard';
import { Survey } from '~/models/survey';
import { getAuthenticator } from '~/utils/auth.server';
import { getSupabaseClient } from '~/utils/supabase.server';

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  }) as { id: string };

  const supabase = getSupabaseClient(context);
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('id, title, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
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
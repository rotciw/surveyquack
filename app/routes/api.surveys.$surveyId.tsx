import { json, LoaderFunction } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ params, context }) => {
  const { surveyId } = params;

  const supabase = getSupabaseClient(context);
  if (!surveyId) throw new Error("Survey ID is required");

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', surveyId)
    .single();

  if (error || !survey) {
    return json({ error: "Survey not found" }, { status: 404 });
  }

  return json({ survey });
};

import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params, context }) => {
  const { surveyId } = params;
  const formData = await request.formData();
  const categoryId = formData.get("categoryId") as string;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const { data, error } = await supabase
    .from('surveys')
    .update({ active_category: categoryId })
    .eq('id', surveyId);

  if (error) throw new Error(error.message);
  return json({ success: true });
};

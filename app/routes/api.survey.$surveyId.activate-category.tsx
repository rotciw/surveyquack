import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { surveyId } = params;
  const formData = await request.formData();
  const categoryId = formData.get("categoryId") as string;
  const { data, error } = await supabase
    .from('surveys')
    .update({ activeCategory: categoryId })
    .eq('id', surveyId);

  if (error) throw new Error(error.message);
  return json({ success: true });
};

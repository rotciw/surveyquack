import { ActionFunction, json } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { surveyId } = params;
  const formData = await request.formData();
  const categoryId = formData.get("categoryId");

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('user_id')
    .eq('id', surveyId)
    .single();

  if (surveyError) throw new Error(surveyError.message);

  if (survey.user_id !== user.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const { error } = await supabase
    .from('surveys')
    .update({ active_category: categoryId })
    .eq('id', surveyId);

  if (error) throw new Error(error.message);

  return json({ success: true });
};
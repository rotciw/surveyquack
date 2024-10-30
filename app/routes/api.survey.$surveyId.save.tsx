import { ActionFunction, json } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";
import type { Survey, Category, Question } from "~/models/survey";

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await getAuthenticator(context).isAuthenticated(request, {
    failureRedirect: "/login",
  }) as { id: string };

  const { surveyId } = params;
  if (!surveyId) throw new Error("Survey ID is required");
  
  const formData = await request.formData();
  const surveyData = JSON.parse(formData.get("survey") as string) as Survey;
  
  const supabase = getSupabaseClient(context);

  // Verify ownership
  const { data: existingSurvey, error: verifyError } = await supabase
    .from('surveys')
    .select('user_id')
    .eq('id', surveyId)
    .single();

  if (verifyError) throw new Error(verifyError.message);
  if (existingSurvey.user_id !== user.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  // Update survey
  const { error: surveyError } = await supabase
    .from('surveys')
    .update({ title: surveyData.title, status: surveyData.status })
    .eq('id', surveyId);

  if (surveyError) throw new Error(surveyError.message);

  // Update categories using upsert
  for (const category of surveyData.categories) {
    const { error: categoryError } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        survey_id: surveyId,
        title: category.title
      });

    if (categoryError) throw new Error(categoryError.message);

    // Update questions using upsert
    for (const question of category.questions) {
      const { error: questionError } = await supabase
        .from('questions')
        .upsert({
          id: question.id,
          category_id: category.id,
          title: question.title,
          subtitle: question.subtitle,
          type: question.type,
          options: question.options,
          scale_start: question.type === 'linear_scale' ? question.scale_start : null,
          scale_end: question.type === 'linear_scale' ? question.scale_end : null,
          scale_left_label: question.type === 'linear_scale' ? question.scale_left_label : null,
          scale_right_label: question.type === 'linear_scale' ? question.scale_right_label : null
        });

      if (questionError) throw new Error(questionError.message);
    }
  }
  
  return json({ success: true });
}; 
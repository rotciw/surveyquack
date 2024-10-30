import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";
import type { Survey } from "~/models/survey";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, context }) => {
  const supabase = getSupabaseClient(context);
  const session = await getSession(context, request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/");
  }

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  return json(surveys);
};


export const action: ActionFunction = async ({ request, context  }) => {
  const supabase = getSupabaseClient(context);
  const session = await getSession(context, request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/");
  }

  const formData = await request.formData();
  const surveyData = JSON.parse(formData.get("survey") as string) as Survey;

  const { data: surveyInsert, error: surveyError } = await supabase
    .from('surveys')
    .insert({ title: surveyData.title, user_id: user.id })
    .select()
    .single();

  if (surveyError) throw new Error(surveyError.message);

  const surveyId = surveyInsert.id;

  for (const category of surveyData.categories) {
    const { data: categoryInsert, error: categoryError } = await supabase
      .from('categories')
      .insert({ survey_id: surveyId, title: category.title })
      .select()
      .single();

    if (categoryError) throw new Error(categoryError.message);

    const categoryId = categoryInsert.id;

    for (const question of category.questions) {
      const { error: questionError } = await supabase
        .from('questions')
        .insert({
          category_id: categoryId,
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

  const uniqueUrl = `/survey/${surveyId}`;
  return json({ success: true, id: surveyId, url: uniqueUrl });
};

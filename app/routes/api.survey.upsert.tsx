import { ActionFunction, json } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";

type User = { id: string };

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  }) as User;

  const formData = await request.formData();
  const surveyData = JSON.parse(formData.get("survey") as string);

  let result;
  if (surveyData.id) {
    // Update existing survey
    const { data, error } = await supabase
      .from('surveys')
      .update({ title: surveyData.title })
      .eq('id', surveyData.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    result = data;

    // Update categories
    for (const category of surveyData.categories) {
      if (category.id) {
        await supabase
          .from('categories')
          .update({ title: category.title })
          .eq('id', category.id);
      } else {
        await supabase
          .from('categories')
          .insert({ title: category.title, survey_id: surveyData.id });
      }

      // Update or insert questions
      for (const question of category.questions) {
        if (question.id) {
          await supabase
            .from('questions')
            .update(question)
            .eq('id', question.id);
        } else {
          await supabase
            .from('questions')
            .insert({ ...question, category_id: category.id });
        }
      }
    }
  } else {
    // Insert new survey
    const { data, error } = await supabase
      .from('surveys')
      .insert({ title: surveyData.title, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    result = data;

    // Insert categories and questions
    for (const category of surveyData.categories) {
      const { data: categoryData } = await supabase
        .from('categories')
        .insert({ title: category.title, survey_id: result.id })
        .select()
        .single();

      for (const question of category.questions) {
        await supabase
          .from('questions')
          .insert({ ...question, category_id: categoryData.id });
      }
    }
  }

  return json({ survey: result });
};

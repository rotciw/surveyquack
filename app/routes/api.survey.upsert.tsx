import { ActionFunction, json } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/utils/auth.server";
import { getSupabaseClient } from "~/utils/supabase.server";

type User = { id: string };

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = getAuthenticator(context);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  }) as User;

  const formData = await request.formData();
  const surveyData = JSON.parse(formData.get("survey") as string);

  const supabase = getSupabaseClient(context);
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
          .update({ 
            title: category.title,
            order: surveyData.categories.indexOf(category)
          })
          .eq('id', category.id);
      } else {
        await supabase
          .from('categories')
          .insert({ 
            title: category.title, 
            survey_id: surveyData.id,
            order: surveyData.categories.indexOf(category)
          });
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
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .insert({ title: category.title, survey_id: result.id })
        .select()
        .single();

      if (!categoryData || categoryError) throw new Error(categoryError?.message || 'Failed to create category');

      for (const question of category.questions) {
        await supabase
          .from('questions')
          .insert({ 
            ...question, 
            category_id: categoryData.id,
            order: category.questions.indexOf(question)
          });
      }
    }
  }

  return json({ survey: result });
};

import type { ActionFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";
import { getAuthenticator } from "~/utils/auth.server";
import { Question } from "~/models/survey";

export const action: ActionFunction = async ({ request, context }) => {
  const user = await getAuthenticator(context).isAuthenticated(request, {
    failureRedirect: "/",
  });

  if (!user || !user.id) {
    throw new Error("User not authenticated");
  }

  const formData = await request.formData();
  const surveyData = JSON.parse(formData.get('survey') as string);
  
  const supabase = getSupabaseClient(context);

  try {
    // Create the survey first
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        title: surveyData.title,
        status: 'draft',
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (surveyError) throw surveyError;

    // Create categories with their questions
    for (const category of surveyData.categories) {
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          title: category.title,
          description: category.description || '',
          survey_id: survey.id
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      // Create questions for this category
      const questionsWithCategoryId = category.questions.map((question: Question, index: number) => ({
        ...question,
        category_id: newCategory.id,
        order: index
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithCategoryId);

      if (questionsError) throw questionsError;
    }

    return redirect(`/survey/${survey.id}/manage`);
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

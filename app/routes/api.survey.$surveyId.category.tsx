import type { LoaderFunction, ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSupabaseClient } from "~/utils/supabase.server";

// Simple loader for polling the active category
export const loader: LoaderFunction = async ({ params, context }) => {
  const { surveyId } = params;
  const supabase = getSupabaseClient(context);

  if (!surveyId) throw new Error("Survey ID is required");

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('active_category')
    .eq('id', surveyId)
    .single();

  if (error) throw new Error(error.message);

  return json({ activeCategory: survey?.active_category });
};

// Keep the action for category deletion
export const action: ActionFunction = async ({ request, params, context }) => {
  if (request.method === "DELETE") {
    const { surveyId } = params;
    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const supabase = getSupabaseClient(context);

    // Check if the category is the active category
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('active_category')
      .eq('id', surveyId)
      .single();

    if (surveyError) throw new Error(surveyError.message);

    // If the category is active, update the active_category to null or another category
    if (survey.active_category === categoryId) {
      await supabase
        .from('surveys')
        .update({ active_category: null }) // or set to another category ID
        .eq('id', surveyId);
    }

    // Now delete the questions and the category
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('category_id', categoryId);

    if (questionsError) throw new Error(questionsError.message);

    const { error: categoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('survey_id', surveyId);

    if (categoryError) throw new Error(categoryError.message);
    
    return json({ success: true });
  }
  
  throw new Error("Method not allowed");
};
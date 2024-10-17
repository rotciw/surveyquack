import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";
import type { Survey } from "~/models/survey";

export const loader: LoaderFunction = async () => {
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*');

  if (error) throw new Error(error.message);
  return json(surveys);
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const surveyData = JSON.parse(formData.get("survey") as string) as Survey;
  
    const { data: surveyInsert, error: surveyError } = await supabase
      .from('surveys')
      .insert({ title: surveyData.title })
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
            options: question.options
          });
  
        if (questionError) throw new Error(questionError.message);
      }
    }
  
    const uniqueUrl = `/survey/${surveyId}`;
    return json({ success: true, id: surveyId, url: uniqueUrl });
  };
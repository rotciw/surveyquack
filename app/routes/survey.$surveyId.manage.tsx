import { useLoaderData, useFetcher } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { surveyId } = params;

  const { data: survey, error } = await supabase
    .from('surveys')
    .select('*, categories(*)')
    .eq('id', surveyId)
    .single();

  if (error) throw new Error(error.message);

  if (survey.user_id !== user.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return json({ survey });
};

export default function ManageSurvey() {
  const { survey } = useLoaderData();
  const fetcher = useFetcher();

  const advanceCategory = (categoryId) => {
    fetcher.submit(
      { categoryId },
      { method: "post", action: `/api/survey/${survey.id}/advance-category` }
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>
      <h2 className="text-xl font-semibold mb-2">Categories</h2>
      <ul>
        {survey.categories.map((category) => (
          <li key={category.id} className="mb-2 flex items-center">
            <span className="mr-2">{category.title}</span>
            <button
              onClick={() => advanceCategory(category.id)}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              Advance
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { authenticator } from "~/utils/auth.server";
import { supabase } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*');

  if (error) throw new Error(error.message);

  return json({ user, surveys });
};

export default function Dashboard() {
  const { user, surveys } = useLoaderData();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
      <h2 className="text-xl font-semibold mb-2">All Surveys</h2>
      <ul>
        {surveys.map((survey) => (
          <li key={survey.id} className="mb-2">
            <Link to={`/survey/${survey.id}/manage`} className="text-blue-500 hover:underline">
              {survey.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/create"
        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create New Survey
      </Link>
    </div>
  );
}
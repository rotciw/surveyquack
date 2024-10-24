import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { supabase } from "~/utils/supabase.server";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/");
  }

  const { data: surveys, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  return json({ user, surveys });
};

export default function Dashboard() {
  const { user, surveys } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Welcome, {user.name}</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Surveys</h2>
        {surveys.length > 0 ? (
          <ul className="space-y-4">
            {surveys.map((survey) => (
              <li key={survey.id} className="bg-white shadow rounded-lg p-4">
                <Link to={`/survey/${survey.id}/manage`} className="text-lg font-medium text-indigo-600 hover:text-indigo-500">
                  {survey.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You haven't created any surveys yet.</p>
        )}
        <Link
          to="/create"
          className="mt-8 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Survey
        </Link>
      </div>
    </div>
  );
}
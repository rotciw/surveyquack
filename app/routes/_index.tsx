import { Link, Form, useLoaderData, useRouteError } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { getSession } from "~/utils/session.server";
import { useState } from "react";

interface LoaderData {
  user: any; // Replace 'any' with your actual user type if available
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getSession(context, request.headers.get("Cookie"));
  const user = session.get("user");
  return json({ user });
};

export default function Index() {
  const { user } = useLoaderData<LoaderData>();
  const [surveyId, setSurveyId] = useState('');

  const handleJoinSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyId) {
      window.location.href = `/survey/${surveyId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Professional Surveys
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Design, distribute, and analyze surveys with ease
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleJoinSurvey} className="space-y-6">
            <div>
              <label htmlFor="survey-id" className="block text-sm font-medium text-gray-700">
                Survey ID
              </label>
              <div className="mt-1">
                <input
                  id="survey-id"
                  name="survey-id"
                  type="text"
                  required
                  value={surveyId}
                  onChange={(e) => setSurveyId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Join Survey
              </button>
            </div>
          </form>

          {!user && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                <Form action="/auth/google" method="post">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Login with Google
                  </button>
                </Form>
              </div>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Link
            to="/create"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create New Survey
          </Link>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Index route error:', {
    error,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });

  return (
    <div className="error-container">
      <h1>Error</h1>
      <pre>{error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
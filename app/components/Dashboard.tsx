import { Link } from "@remix-run/react";
import type { Survey } from "~/models/survey";

export function Dashboard({ surveys }: { surveys: Survey[] }) {
  if (!surveys || surveys.length === 0) {
    return <div>No surveys available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Surveys</h1>
      <ul>
        {surveys.map((survey) => (
          <li key={survey.id} className="mb-4 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <span className="text-lg">{survey.title || "Untitled Survey"}</span>
              <div className="space-x-4">
                <Link
                  to={`/survey/${survey.id}/stats`}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Stats
                </Link>
                <Link
                  to={`/survey/${survey.id}/manage`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Manage
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
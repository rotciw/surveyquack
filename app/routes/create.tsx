import React from "react";
import { SurveyCreator } from "~/components/SurveyCreator";
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";

type LoaderData = {
  user: {
    id: string;
    // add other user properties as needed
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  return json<LoaderData>({ user });
};

export default function CreateSurvey() {
  const { user } = useLoaderData<LoaderData>();
  const initialSurvey = {
    id: "",
    title: "Untitled Survey",
    user_id: user.id,
    status: "draft" as const,
    categories: [
      {
        id: "",
        title: "Untitled Category",
        questions: [
          {
            id: "",
            title: "Untitled Question",
            type: "multiple_choice" as const,
            options: ["Option 1"],
          },
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Survey</h1>
      <SurveyCreator user={user} initialSurvey={initialSurvey} />
    </div>
  );
}

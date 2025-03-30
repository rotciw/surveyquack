import { Link } from "@remix-run/react";
import type { Survey } from "~/models/survey";
import { useState, useEffect } from "react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { CreateSurveyModal } from "~/components/CreateSurveyModal";

// Define the response type for delete operation
type DeleteResponse = {
  success: boolean;
  message?: string;
};

export function Dashboard({ surveys }: { surveys: Survey[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);
  const createFetcher = useFetcher();
  const deleteFetcher = useFetcher<DeleteResponse>();
  const navigate = useNavigate();

  const handleCreateSurvey = () => {
    const initialSurvey = {
      title: "Untitled Survey",
      description: "",
      status: "draft",
      categories: [{
        title: "Untitled Category",
        questions: [{
          title: "Untitled Question",
          type: "multiple_choice",
          options: ["Option 1"]
        }]
      }]
    };

    createFetcher.submit(
      { survey: JSON.stringify(initialSurvey) },
      { method: "post", action: "/api/surveys" }
    );
    setShowCreateModal(false);
  };

  const handleDeleteSurvey = (surveyId: string) => {
    if (window.confirm("Are you sure you want to delete this survey? This action cannot be undone.")) {
      setDeletingSurveyId(surveyId);
      deleteFetcher.submit(
        {},
        { method: "post", action: `/api/survey/${surveyId}/delete` }
      );
    }
  };

  // Use useEffect to handle the completion of the delete operation
  useEffect(() => {
    // Only proceed if we were in the process of deleting
    if (deletingSurveyId && deleteFetcher.state === 'idle') {
      if (deleteFetcher.data) {
        // Check if there was an error
        if (!deleteFetcher.data.success) {
          alert(deleteFetcher.data.message || "Failed to delete survey");
        } else {
          console.log("Survey deleted successfully");
          // Use navigate to refresh the current page
          navigate(".", { replace: true });
        }
      }
      // Reset deleting state whether successful or not
      setDeletingSurveyId(null);
    }
  }, [deleteFetcher.state, deleteFetcher.data, deletingSurveyId, navigate]);

  if (!surveys || surveys.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to Survey Creator</h1>
        <p className="text-gray-600 mb-8">You haven't created any surveys yet. Get started by creating your first survey!</p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
        >
          Create Your First Survey
        </button>
        <CreateSurveyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateSurvey}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Surveys</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
        >
          Create New Survey
        </button>
      </div>
      
      <CreateSurveyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateSurvey}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {surveys.map((survey) => (
              <tr key={survey.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                  <Link
                      to={`/survey/${survey.id}/manage`}
                      className="text-indigo-600 hover:text-indigo-900 text-black"
                    >
                      {survey.title || "Untitled Survey"}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    survey.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.status === 'open' ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(survey.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <Link
                      to={`/survey/${survey.id}/stats`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Stats
                    </Link>
                    <Link
                      to={`/survey/${survey.id}/manage`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      disabled={deletingSurveyId === survey.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingSurveyId === survey.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
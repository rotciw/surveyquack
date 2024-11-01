import { Survey } from "~/models/survey";

interface SurveyHeaderProps {
  survey: Survey;
  uniqueUrl: string | null;
  updateSurveyTitle: (title: string) => void;
  toggleSurveyStatus: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function SurveyHeader({ 
  survey, 
  uniqueUrl, 
  updateSurveyTitle, 
  toggleSurveyStatus,
  onSave,
  isSaving 
}: SurveyHeaderProps) {
  return (
    <div className="bg-gray-50 border-b px-4 py-3">
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 gap-4">
        {/* Left side - Survey Title */}
        <div className="flex items-center">
          <input
            type="text"
            value={survey.title}
            onChange={(e) => updateSurveyTitle(e.target.value)}
            className="text-xl font-medium p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white w-full"
            placeholder="Survey Title"
          />
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center justify-end gap-3">
          {uniqueUrl && (
            <>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="text"
                  value={uniqueUrl}
                  readOnly
                  className="bg-white px-3 py-2 rounded border text-sm w-full font-mono text-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(uniqueUrl)}
                  className="text-blue-500 hover:text-blue-600 p-2 flex-shrink-0"
                >
                  📋
                </button>
              </div>
              <a
                href={uniqueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 px-4 py-2 border border-blue-500 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                Preview
              </a>
            </>
          )}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isSaving ? 'Saving...' : 'Save Survey'}
          </button>
          {uniqueUrl && (
            <button
              onClick={toggleSurveyStatus}
              className={`px-4 py-2 text-white rounded flex-shrink-0 ${
                survey.status === 'open' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } transition-colors`}
            >
              {survey.status === 'open' ? 'Close Survey' : 'Open Survey'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
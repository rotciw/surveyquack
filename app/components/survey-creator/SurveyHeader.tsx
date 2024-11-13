import { Survey } from "~/models/survey";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';

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
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg!);
    const img = new Image();
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Create download link
      const link = document.createElement("a");
      link.download = `${survey.title}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(svgUrl);
    };
    
    img.src = svgUrl;
  };

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
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="text-blue-500 hover:text-blue-600 p-2 flex-shrink-0"
                  title="Show QR Code"
                >
                  📱
                </button>
              </div>
              {/* QR Code Modal */}
              {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Scan QR Code</h3>
                      <button 
                        onClick={() => setShowQR(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div ref={qrRef} className="bg-white p-4">
                      <QRCodeSVG 
                        value={uniqueUrl} 
                        size={256}
                        level="H"
                        marginSize={1}
                      />
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                      <button
                        onClick={downloadQRCode}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <span>💾</span> Save QR Code
                      </button>
                      <button
                        onClick={() => setShowQR(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 text-center">
                      Scan this code to access the survey 
                    </p>
                  </div>
                </div>
              )}
              <a
                href={uniqueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 px-4 py-2 border border-blue-500 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                Preview
              </a>
              <a
                href={`/survey/${survey.id}/stats`}
                className="text-green-600 hover:text-green-700 px-4 py-2 border border-green-600 rounded hover:bg-green-50 transition-colors flex-shrink-0"
              >
                Admin
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
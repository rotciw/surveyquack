import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`rounded-lg px-4 py-3 shadow-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' :
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        <div className="flex items-center gap-2">
          <span>{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
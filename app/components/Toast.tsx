import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg border border-gray-200 bg-white`}>
        <div className={`w-2 h-2 rounded-full ${
          type === 'success' ? 'bg-green-500' :
          type === 'error' ? 'bg-red-500' :
          type === 'info' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
        }`} />
        <span className="text-sm text-gray-600">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
} 
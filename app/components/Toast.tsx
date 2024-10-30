interface ToastProps {
  message: string;
  type: 'info' | 'success';
}

export function Toast({ message, type }: ToastProps) {
  const bgColor = type === 'info' ? 'bg-blue-500' : 'bg-green-500';
  
  return (
    <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
      {type === 'info' ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
} 